defmodule DragnCardsGame.Evaluate do
  @moduledoc """
  Module that defines and evaluates the LISP-like language used to modify the game state.
  """
  require Logger
  alias DragnCardsGame.{GameUI}
  alias DragnCards.{Rooms, Plugins}

  def put_by_path(game_old, path, val_new) do
    # IO.puts("val_new 1")
    # IO.inspect(path)
    # IO.inspect(val_new)
    # IO.puts("val_new 2")
    path_minus_key = Enum.slice(path, 0, Enum.count(path)-1)
    # IO.puts("path_minus_key 1")
    # IO.inspect(path_minus_key)
    # IO.puts("put_by_keys 1")
    # IO.inspect(Map.keys(game_old))
    game_new =
      if path_minus_key == [] do
        put_in(game_old, path, val_new)
      else
        case get_in(game_old, path_minus_key) do
          nil ->
            evaluate(game_old, ["LOG_DEV", "Error: Tried to set a value at a nonexistent path: "] ++ path_minus_key)

          _val_old ->
            put_in(game_old, path, val_new)
        end
      end

    if game_new["automation"] do
      Enum.reduce(game_new["automation"], game_new, fn({_id, automation}, acc) ->
        apply_automation_rules(automation, path, game_old, acc)
      end)
    else
      game_new
    end
  end

  def apply_automation_rules(automation, path, game_old, game_new) do
    # Save current values of THIS and TARGET
    prev_this_id = evaluate(game_new, "$THIS_ID")
    prev_this = evaluate(game_new, "$THIS")
    prev_target_id = evaluate(game_new, "$TARGET_ID")
    prev_target = evaluate(game_new, "$TARGET")

    game_new =
      if automation["this_id"] do
        game_new |>
        evaluate(["DEFINE", "$THIS_ID", automation["this_id"]]) |>
        evaluate(["DEFINE", "$THIS", "$GAME.cardById.$THIS_ID"])
      else
        game_new
      end
    game_old =
      if automation["this_id"] do
        game_old |>
        evaluate(["DEFINE", "$THIS_ID", automation["this_id"]]) |>
        evaluate(["DEFINE", "$THIS", "$GAME.cardById.$THIS_ID"])
      else
        game_old
      end
    game_new =
      if Enum.count(path) > 2 do
        game_new |>
        evaluate(["DEFINE", "$TARGET_ID", Enum.at(path,1)]) |>
        evaluate(["DEFINE", "$TARGET", "$GAME."<>Enum.at(path,0)<>".$TARGET_ID"])
      else
        game_new
      end
    game_old =
      if Enum.count(path) > 2 do
        game_old |>
        evaluate(["DEFINE", "$TARGET_ID", Enum.at(path,1)]) |>
        evaluate(["DEFINE", "$TARGET", "$GAME."<>Enum.at(path,0)<>".$TARGET_ID"])
      else
        game_old
      end
    game_new = Enum.reduce(automation["rules"], game_new, fn(rule, acc)->
      #IO.puts("applying rule")
      #IO.inspect(rule)
      apply_automation_rule(rule, path, game_old, acc)
    end)

    # Restore THIS and TARGET
    game_new |>
      evaluate(["DEFINE", "$THIS_ID", prev_this_id]) |>
      evaluate(["DEFINE", "$THIS", prev_this]) |>
      evaluate(["DEFINE", "$TARGET_ID", prev_target_id]) |>
      evaluate(["DEFINE", "$TARGET", prev_target])
  end

  def apply_automation_rule(rule, path, game_old, game_new) do
    if path_matches_listenpaths?(path, rule["listenTo"], game_new) do
      case rule["type"] do
        "trigger" ->
          apply_trigger_rule(rule, game_old, game_new)
        "passive" ->
          apply_passive_rule(rule, game_old, game_new)
        _ ->
          game_new
      end
    else
      game_new
    end
  end

  def apply_trigger_rule(rule, game_old, game_new) do
    game_new = put_in(game_new["prev_game"], game_old)
    game_new = if evaluate(game_new, rule["condition"]) do
      evaluate(game_new, rule["then"], ["THEN"])
    else
      game_new
    end
    put_in(game_new["prev_game"], nil)
  end

  def apply_passive_rule(rule, game_old, game_new) do
    onBefore = evaluate(game_old, rule["condition"])
    onAfter = evaluate(game_new, rule["condition"])

    cond do
      !onBefore && onAfter ->
        evaluate(game_new, rule["onDo"], ["ON_DO"])
      onBefore && !onAfter ->
        evaluate(game_new, rule["offDo"], ["OFF_DO"])
      true ->
        game_new
    end
  end

  def path_matches_listenpaths?(path, listenpaths, game_new) do
    if Enum.any?(listenpaths, fn(listenpath) -> path_matches_listenpath?(path, listenpath, game_new) end) do
      true
    else
      false
    end
  end

  def path_matches_listenpath?(path, listenpath, game_new) do
    Enum.count(path) == Enum.count(listenpath)
    && Enum.zip(path, listenpath)
    |> Enum.all?(fn {x, y} -> evaluate(game_new, x) == evaluate(game_new, y) || y == "*" end)
  end

  def message_list_to_string(game, statements) do
    Enum.reduce(statements, "", fn(statement, acc) ->
      str_statement = inspect(evaluate(game, statement))
      acc <> String.replace(str_statement,"\"","")
    end)
  end

  @spec convert_to_integer(String.t() | nil) :: number
  def convert_to_integer(my_string) do
    if my_string == nil do
      nil
    else
      result = Integer.parse("#{my_string}")
      case result do
        {number, _} -> number
        :error -> 0
      end
    end
  end


  def evaluate_with_timeout(game, code, timeout_ms \\ 500) do
    ref = make_ref()

    task = Task.async(fn ->
      evaluate(game, code)
    end)

    case Task.yield(task, timeout_ms) do
      nil ->
        Task.shutdown(task, :brutal_kill)
        evaluate(game, ["LOG", "Action timed out."])
      {:ok, result} ->
        result
    end
  end

  def evaluate(game, code, history \\ []) do
    # IO.puts("evaluate 1")
    # IO.inspect(code)
    # IO.inspect(history)

    if is_list(code) && Enum.count(code) > 0 do

      if is_list(Enum.at(code, 0)) do

        Enum.reduce(code, game, fn(action, acc) ->
          evaluate(acc, action)
        end)

      else

        case Enum.at(code,0) do
          "PREV" ->
            evaluate(game["prev_game"], Enum.at(code, 1))

          "LOG_DEV" ->
            IO.puts("LOG_DEV:")
            IO.inspect(Enum.at(code, 1))
            IO.inspect(evaluate(game, Enum.at(code, 1)))
            game

          "DEFINE" ->
            var_name = Enum.at(code, 1)
            value = evaluate(game, Enum.at(code, 2))
            #IO.puts("DEFINE #{var_name}")
            #IO.inspect(value)
            put_in(game, ["variables", var_name], value)

          "POINTER" ->
            Enum.at(code, 1)

          "LIST" ->
            list = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce(list, [], fn(item,acc)->
              acc ++ [evaluate(game, item)]
            end)

          "APPEND" ->
            list = evaluate(game, Enum.at(code, 1)) || []
            list ++ [evaluate(game, Enum.at(code, 2))]

          "NEXT_PLAYER" ->
            current_player_i = evaluate(game, Enum.at(code, 1))
            current_i = String.to_integer(String.slice(current_player_i, -1..-1))
            next_i = current_i + 1
            next_i = if next_i > game["numPlayers"] do 1 else next_i end
            "player" <> Integer.to_string(next_i)

          "GET_INDEX" ->
            list = evaluate(game, Enum.at(code, 1))
            value = evaluate(game, Enum.at(code, 2))
            Enum.find_index(list, fn(x) -> x == value end)

          "AT_INDEX" ->
            list = evaluate(game, Enum.at(code, 1))
            index = evaluate(game, Enum.at(code, 2))
            if list do Enum.at(list, index) else nil end

          "LENGTH" ->
            Enum.count(evaluate(game, Enum.at(code,1)))

          "AND" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(statements, false, fn(statement, acc) ->
              if evaluate(game, statement) == true do
                {:cont, true}
              else
                {:halt, false}
              end
            end)

          "OR" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(statements, false, fn(statement, acc) ->
              if evaluate(game, statement) == true do
                {:cont, true}
              else
                {:cont, acc}
              end
            end)

          "EQUAL" ->
            evaluate(game, Enum.at(code,1)) == evaluate(game, Enum.at(code,2))

          "NOT_EQUAL" ->
            evaluate(game, Enum.at(code,1)) != evaluate(game, Enum.at(code,2))

          "LESS_THAN" ->
            evaluate(game, Enum.at(code,1)) < evaluate(game, Enum.at(code,2))

          "GREATER_THAN" ->
            evaluate(game, Enum.at(code,1)) > evaluate(game, Enum.at(code,2))

          "LESS_EQUAL" ->
            evaluate(game, Enum.at(code,1)) <= evaluate(game, Enum.at(code,2))

          "GREATER_EQUAL" ->
            evaluate(game, Enum.at(code,1)) >= evaluate(game, Enum.at(code,2))

          "NOT" ->
            !evaluate(game, Enum.at(code,1))

          "JOIN_STRING" ->
            evaluate(game, Enum.at(code,1)) <> evaluate(game, Enum.at(code,2))

          "IN_STRING" ->
            String.contains?(evaluate(game, Enum.at(code,1)), evaluate(game, Enum.at(code,2)))

          "IN_LIST" ->
            list = evaluate(game, Enum.at(code,1)) || []
            Enum.member?(list, evaluate(game, Enum.at(code,2)))

          "REMOVE_FROM_LIST_BY_VALUE" ->
            list = evaluate(game, Enum.at(code,1)) || []
            value = evaluate(game, Enum.at(code,2))
            Enum.filter(list, fn(x) -> x != value end)

          "ADD" ->
            (evaluate(game, Enum.at(code,1)) || 0) + (evaluate(game, Enum.at(code,2)) || 0)

          "SUBTRACT" ->
            (evaluate(game, Enum.at(code,1)) || 0) - (evaluate(game, Enum.at(code,2)) || 0)

          "MULTIPLY" ->
            (evaluate(game, Enum.at(code,1)) || 0) * (evaluate(game, Enum.at(code,2)) || 0)

          "DIVIDE" ->
            divisor = (evaluate(game, Enum.at(code,2)) || 0)
            if divisor do (evaluate(game, Enum.at(code,1)) || 0) / divisor else nil end

          "RANDOM_INT" ->
            mn = evaluate(game, Enum.at(code,1))
            mx = evaluate(game, Enum.at(code,2))
            Enum.random(mn, mx)

          "OBJ_GET_VAL" ->
            map = evaluate(game, Enum.at(code,1))
            key = evaluate(game, Enum.at(code,2))
            map[key]

          "OBJ_GET_BY_PATH" ->
            map = evaluate(game, Enum.at(code,1))
            path = evaluate(game, Enum.at(code,2))
            Enum.reduce(path, map, fn(pathi, acc) ->
              cond do
                String.starts_with?(pathi, "[") and String.ends_with?(pathi, "]") ->
                  int_str = evaluate(game, String.slice(pathi,1..-2))
                  int = convert_to_integer(int_str)
                  Enum.at(acc, int)
                pathi == "currentFace" ->
                  acc["sides"][acc["currentSide"]]
                pathi == "stackParentCard" ->
                  game["cardById"][acc["stackParentCardId"]]
                Map.has_key?(acc, pathi) ->
                  Map.get(acc, evaluate(game, pathi))
                true ->
                  nil
              end
            end)

          "GAME_GET_VAL" ->
            path = evaluate(game, Enum.at(code,1))
            get_in(game, path)

          "GET_STACK_ID" ->
            group_id = evaluate(game, Enum.at(code,1))
            stack_index = evaluate(game, Enum.at(code,2))
            if group_id do evaluate(game, ["AT_INDEX", "$GAME.groupById." <> group_id <> ".stackIds", stack_index]) else nil end

          "GET_CARD_ID" ->
            group_id = evaluate(game, Enum.at(code,1))
            stack_index = evaluate(game, Enum.at(code,2))
            stack_id = evaluate(game, ["GET_STACK_ID", group_id, stack_index])
            card_index = evaluate(game, Enum.at(code,3))
            if stack_id do evaluate(game, ["AT_INDEX", "$GAME.stackById." <> stack_id <> ".cardIds", card_index]) else nil end

          "OBJ_SET_VAL" ->
            case Enum.count(code) do
              4 ->
                obj = evaluate(game, Enum.at(code,1))
                key = evaluate(game, Enum.at(code,2))
                value = evaluate(game, Enum.at(code,3))
                put_in(obj[key], value)
              5 ->
                obj = evaluate(game, Enum.at(code,1))
                path = evaluate(game, Enum.at(code,2))
                key = evaluate(game, Enum.at(code,3))
                value = evaluate(game, Enum.at(code,4))
                put_in(obj, path ++ [key], value)
            end

          "SET" ->
            path = evaluate(game, Enum.at(code, 1))
            value = evaluate(game, Enum.at(code, 2))
            put_by_path(game, path, value)

          "UPDATE_ROOM_NAME" ->
            name = evaluate(game, Enum.at(code, 1))
            Rooms.update_room_name_by_slug(game["roomSlug"], name)
            evaluate(game, ["SET", "/roomName", name])

          "INCREASE_VAL" ->
            path = evaluate(game, Enum.at(code, 1))
            delta = evaluate(game, Enum.at(code, 2))
            old_value = get_in(game, path) || 0
            put_by_path(game, path, old_value + delta)

          "DECREASE_VAL" ->
            path = Enum.slice(code, 1, Enum.count(code)-2)
            delta = evaluate(game, Enum.at(code, Enum.count(code)-1))
            evaluate(game, ["INCREASE_VAL", Enum.at(code, 1), -Enum.at(code, 2)])

          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(0..Enum.count(ifthens)-1//2, nil, fn(i, acc) ->
              if evaluate(game, Enum.at(ifthens, i)) == true do
                {:halt, evaluate(game, Enum.at(ifthens, i+1))}
              else
                {:cont, game}
              end
            end)

          "LOG" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = message_list_to_string(game, statements)
            put_in(game["messages"], game["messages"] ++ [message])

          "FOR_EACH_START_STOP_STEP" ->
            var_name = Enum.at(code, 1)
            start = evaluate(game, Enum.at(code, 2))
            stop = evaluate(game, Enum.at(code, 3))
            step = evaluate(game, Enum.at(code, 4))
            function = Enum.at(code, 5)
            Enum.reduce(start..stop-1//step, game, fn(i, acc) ->
              acc = put_in(acc, ["variables", var_name], i)
              acc = evaluate(acc, function)
            end)

          "FOR_EACH_KEY_VAL" ->
            argc = Enum.count(code) - 1
            key_name = Enum.at(code, 1)
            val_name = Enum.at(code, 2)
            old_list = evaluate(game, Enum.at(code, 3))
            function = Enum.at(code, 4)
            old_list = if argc >= 5 do
              order = if argc >= 6 and evaluate(game, Enum.at(code, 6)) == "DESC" do :desc else :asc end
              Enum.sort_by(old_list, fn({key, obj}) -> get_in(obj, evaluate(game,Enum.at(code, 5))) end, order)
            else
              old_list
            end
            Enum.reduce(old_list, game, fn({key, val}, acc) ->
              acc = put_in(acc, ["variables", key_name], key)
              acc = put_in(acc, ["variables", val_name], val)
              evaluate(acc, function)
            end)

          "FOR_EACH_VAL" ->
            argc = Enum.count(code) - 1
            val_name = Enum.at(code, 1)
            list = evaluate(game, Enum.at(code, 2))
            function = Enum.at(code, 3)
            Enum.reduce(list, game, fn(val, acc) ->
              acc = put_in(acc, ["variables", val_name], val)
              evaluate(acc, function)
            end)

          "MOVE_CARD" ->
            IO.puts("MOVE_CARD" <> inspect(code))
            argc = Enum.count(code) - 1
            card_id = evaluate(game, Enum.at(code, 1))
            if card_id do
              dest_group_id = evaluate(game, Enum.at(code, 2))
              dest_stack_index = evaluate(game, Enum.at(code, 3))
              dest_card_index = if argc >= 4 do evaluate(game, Enum.at(code, 4)) else 0 end
              combine = if argc >= 5 do evaluate(game, Enum.at(code, 5)) else false end
              GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine)
            else
              game
            end

          "LOAD_CARDS" ->
            load_list = evaluate(game, Enum.at(code, 1))
            # If load_list is a string, it's a preBuiltDeckId - get the list from game_def
            load_list = if is_binary(load_list) do
              load_list_id = load_list
              game_def = Plugins.get_game_def(game["options"]["pluginId"])
              get_in(game_def, ["preBuiltDecks", load_list_id, "cards"])
            else
              load_list
            end
            GameUI.load_cards(game, evaluate(game, "$PLAYER_N", ["LOAD_CARDS" | history]), load_list)

          "DELETE_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1))
            game
            |> GameUI.delete_card(card_id)

          "ATTACH_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1))
            dest_card_id = evaluate(game, Enum.at(code, 2))
            dest_card = game["cardById"][dest_card_id]
            GameUI.move_card(game, card_id, dest_card["groupId"], dest_card["stackIndex"], -1, true)

          "DRAW_CARD" ->
            argc = Enum.count(code) - 1
            num = if argc == 0 do 1 else evaluate(game, Enum.at(code, 1)) end
            player_n = game["playerUi"]["playerN"]
            game
            |> GameUI.move_stacks(player_n <> "Deck", player_n <> "Hand", num, "bottom")

          "MOVE_STACK" ->
            argc = Enum.count(code) - 1
            stack_id = evaluate(game, Enum.at(code, 1))
            dest_group_id = evaluate(game, Enum.at(code, 2))
            dest_stack_index = evaluate(game, Enum.at(code, 3))
            combine = if argc >= 4 do evaluate(game, Enum.at(code, 4)) else nil end
            GameUI.move_stack(game, stack_id, dest_group_id, dest_stack_index, combine)

          "DISCARD_STACK" ->
            stack_id = evaluate(game, Enum.at(code, 1))
            stack = game["stackById"][stack_id]
            card_ids = stack["cardIds"]
            Enum.reduce(card_ids, game, fn(card_id, acc) ->
              evaluate(acc, ["DISCARD_CARD", card_id])
            end)

          "MOVE_STACKS" ->
            argc = Enum.count(code) - 1
            orig_group_id = evaluate(game, Enum.at(code, 1))
            dest_group_id = evaluate(game, Enum.at(code, 2))
            top_n = evaluate(game, Enum.at(code, 3))
            position = evaluate(game, Enum.at(code, 4))
            GameUI.move_stacks(game, orig_group_id, dest_group_id, top_n, position)

          "SHUFFLE_GROUP" ->
            group_id = evaluate(game, Enum.at(code, 1))
            stack_ids = game["groupById"][group_id]["stackIds"]
            shuffled_stack_ids = stack_ids |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], shuffled_stack_ids)

          "SHUFFLE_TOP_X" ->
            group_id = evaluate(game, Enum.at(code, 1))
            x = evaluate(game, Enum.at(code, 2))
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_l = Enum.slice(stack_ids, 0, x)
            stack_ids_r = Enum.slice(stack_ids, x, Enum.count(stack_ids))
            stack_ids_l = stack_ids_l |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "SHUFFLE_BOTTOM_X" ->
            group_id = evaluate(game, Enum.at(code, 1))
            x = evaluate(game, Enum.at(code, 2))
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_r = Enum.slice(stack_ids, -x, x)
            stack_ids_l = Enum.slice(stack_ids, 0, Enum.count(stack_ids) - x)
            stack_ids_r = stack_ids_r |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "FACEUP_NAME_FROM_STACK_ID" ->
            stack_id = evaluate(game, Enum.at(code, 1))
            card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)
            evaluate(game, ["FACEUP_NAME_FROM_CARD_ID", card_id])

          "FACEUP_NAME_FROM_CARD_ID" ->
            card_id = evaluate(game, Enum.at(code, 1))
            card = game["cardById"][card_id]
            face = card["sides"][card["currentSide"]]
            face["name"]

          "ONE_CARD" ->
            var_name = Enum.at(code, 1)
            one_card = Enum.find(Map.values(game["cardById"]), fn(card) ->
              game = evaluate(game, ["DEFINE", var_name, card])
              evaluate(game, Enum.at(code, 2))
            end)
            one_card

          "ACTION_LIST" ->
            argc = Enum.count(code) - 1
            action_list_id = evaluate(game, Enum.at(code, 1))
            game_def = Plugins.get_game_def(game["options"]["pluginId"])
            action_list = game_def["actionLists"][action_list_id]
            case argc do
              1 ->
                evaluate(game, action_list)
              2 ->
                active_card_id = evaluate(game, Enum.at(code, 2))
                game = put_in(game, ["playerUi", "activeCardId"], active_card_id)
                evaluate(game, action_list)
              3 ->
                active_card_id = evaluate(game, Enum.at(code, 2))
                player_n = evaluate(game, Enum.at(code, 3))
                game = put_in(game, ["playerUi", "activeCardId"], active_card_id)
                game = put_in(game, ["playerUi", "playerN"], player_n)
                evaluate(game, action_list)
              _ ->
                game
            end
          _ ->
            #code
            evaluate(game, ["LOG", "Command " <> Enum.at(code,0) <> " not recognized in " <> inspect(code)])
        end
      end
    else # value
      cond do
        code == "$PLAYER_N" ->
          game["playerUi"]["playerN"]

        code == "$GAME" ->
          game

        code == "$GAME_PATH" ->
          []

        code == "$GROUP_BY_ID" ->
          game["groupById"]

        code == "$STACK_BY_ID" ->
          game["stackById"]

        code == "$CARD_BY_ID" ->
          game["cardById"]

        code == "$CARD_BY_ID_PATH" ->
          ["cardById"]

        code == "$PLAYER_DATA" ->
          game["playerData"]

        code == "$PLAYER_DATA_PATH" ->
          ["playerData"]

        code == "$ACTIVE_CARD_PATH" ->
          ["cardById", game["playerUi"]["activeCardId"]]

        code == "$ACTIVE_FACE_PATH" ->
          active_card = evaluate(game, "$ACTIVE_CARD")
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["sides", active_card["currentSide"]]

        code == "$ACTIVE_TOKENS_PATH" ->
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["tokens"]

        code == "$ACTIVE_CARD" ->
          get_in(game, evaluate(game, "$ACTIVE_CARD_PATH"))

        code == "$ACTIVE_CARD_ID" ->
          evaluate(game, "$ACTIVE_CARD.id")

        code == "$ACTIVE_FACE" ->
          get_in(game, evaluate(game, "$ACTIVE_FACE_PATH"))

        code == "$ACTIVE_TOKENS" ->
          get_in(game, evaluate(game, "$ACTIVE_TOKENS_PATH"))

        is_binary(code) and String.starts_with?(code, "$") and String.contains?(code, ".") ->
          split = String.split(code, ".")
          obj = evaluate(game, Enum.at(split, 0))
          path = ["LIST"] ++ Enum.slice(split, 1, Enum.count(split))
          evaluate(game, ["OBJ_GET_BY_PATH", obj, path], [code | history])

        is_binary(code) and String.starts_with?(code, "$") ->
          if Map.has_key?(game, "variables") && Map.has_key?(game["variables"], code) do
            game["variables"][code]
          else
            # Join history together with a comma
            raise "Variable #{code} not found. " <> inspect(history)
          end

        is_binary(code) and String.starts_with?(code, "/") ->
          split = String.split(code, "/")
          path = ["LIST"] ++ Enum.slice(split, 1, Enum.count(split))
          List.flatten(evaluate(game, path))

        true ->
          code
      end
    end
  end
end
