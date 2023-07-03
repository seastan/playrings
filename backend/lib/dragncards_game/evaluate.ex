defmodule DragnCardsGame.Evaluate do
  @moduledoc """
  Module that defines and evaluates the LISP-like language used to modify the game state.
  """
  require Logger
  alias DragnCardsGame.{GameUI}
  alias DragnCards.{Rooms, Plugins}

  def put_by_path(game_old, path, val_new, trace) do
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
            raise("Tried to set a value at a nonexistent path: #{inspect(path_minus_key)}")

          _val_old ->
            put_in(game_old, path, val_new)
        end
      end

    if game_new["automation"] do
      Enum.reduce(game_new["automation"], game_new, fn({id, automation}, acc) ->
        apply_automation_rules(automation, path, game_old, acc, trace ++ ["apply_automation_rules", id])
      end)
    else
      game_new
    end
  end

  def apply_automation_rules(automation, path, game_old, game_new, trace) do

    # Save current values of THIS and TARGET
    prev_this_id = evaluate(game_new, "$THIS_ID", trace ++ ["$THIS_ID"])
    prev_this = evaluate(game_new, "$THIS", trace ++ ["$THIS"])
    prev_target_id = evaluate(game_new, "$TARGET_ID", trace ++ ["$TARGET_ID"])
    prev_target = evaluate(game_new, "$TARGET", trace ++ ["$TARGET"])

    game_new =
      if automation["this_id"] do
        game_new |>
        evaluate(["DEFINE", "$THIS_ID", automation["this_id"]], trace ++ ["game_new"]) |>
        evaluate(["DEFINE", "$THIS", "$GAME.cardById.$THIS_ID"], trace ++ ["game_new"])
      else
        game_new
      end
    game_old =
      if automation["this_id"] do
        game_old |>
        evaluate(["DEFINE", "$THIS_ID", automation["this_id"]], trace ++ ["game_old"]) |>
        evaluate(["DEFINE", "$THIS", "$GAME.cardById.$THIS_ID"], trace ++ ["game_old"])
      else
        game_old
      end
    game_new =
      if Enum.count(path) > 2 do
        game_new |>
        evaluate(["DEFINE", "$TARGET_ID", Enum.at(path,1)], trace ++ ["game_new"]) |>
        evaluate(["DEFINE", "$TARGET", "$GAME."<>Enum.at(path,0)<>".$TARGET_ID"], trace ++ ["game_new"])
      else
        game_new
      end
    game_old =
      if Enum.count(path) > 2 do
        game_old |>
        evaluate(["DEFINE", "$TARGET_ID", Enum.at(path,1)], trace ++ ["game_old"]) |>
        evaluate(["DEFINE", "$TARGET", "$GAME."<>Enum.at(path,0)<>".$TARGET_ID"], trace ++ ["game_old"])
      else
        game_old
      end
    game_new = Enum.reduce(automation["rules"], game_new, fn(rule, acc)->
      #IO.puts("applying rule")
      #IO.inspect(rule)
      apply_automation_rule(rule, path, game_old, acc, trace)
    end)

    # Restore THIS and TARGET
    game_new |>
      evaluate(["DEFINE", "$THIS_ID", prev_this_id], trace ++ ["restore"]) |>
      evaluate(["DEFINE", "$THIS", prev_this], trace ++ ["restore"]) |>
      evaluate(["DEFINE", "$TARGET_ID", prev_target_id], trace ++ ["restore"]) |>
      evaluate(["DEFINE", "$TARGET", prev_target], trace ++ ["restore"])
  end

  def apply_automation_rule(rule, path, game_old, game_new, trace) do
    if path_matches_listenpaths?(path, rule["listenTo"], game_new, trace) do
      case rule["type"] do
        "trigger" ->
          apply_trigger_rule(rule, game_old, game_new, trace ++ ["apply_trigger_rule"])
        "passive" ->
          apply_passive_rule(rule, game_old, game_new, trace ++ ["apply_passive_rule"])
        _ ->
          game_new
      end
    else
      game_new
    end
  end

  def apply_trigger_rule(rule, game_old, game_new, trace) do
    # Stringify the rule
    game_new = put_in(game_new["prev_game"], game_old)
    game_new = if evaluate(game_new, rule["condition"], trace ++ [Jason.encode!(rule["condition"])]) do
      evaluate(game_new, rule["then"], trace ++ [Jason.encode!("THEN")])
    else
      game_new
    end
    put_in(game_new["prev_game"], nil)
  end

  def apply_passive_rule(rule, game_old, game_new, trace) do
    onBefore = evaluate(game_old, rule["condition"], trace ++ ["game_old", Jason.encode!(rule["condition"])])
    onAfter = evaluate(game_new, rule["condition"], trace ++ ["game_new", Jason.encode!(rule["condition"])])

    cond do
      !onBefore && onAfter ->
        evaluate(game_new, rule["onDo"], trace ++ ["ON_DO"])
      onBefore && !onAfter ->
        evaluate(game_new, rule["offDo"], trace ++ ["OFF_DO"])
      true ->
        game_new
    end
  end

  def path_matches_listenpaths?(path, listenpaths, game_new, trace) do
    if Enum.any?(listenpaths, fn(listenpath) -> path_matches_listenpath?(path, listenpath, game_new, trace ++ ["path_matches_listenpath", Jason.encode!(listenpath)]) end) do
      true
    else
      false
    end
  end

  def path_matches_listenpath?(path, listenpath, game_new, trace) do

    # Process listenpath into a list
    listenpath = evaluate(game_new, listenpath, trace ++ ["path_matches_listenpath"])

    # Check if each element in path and listenpath match or if listenpath element is a wildcard
    Enum.count(path) == Enum.count(listenpath)
    && Enum.zip(path, listenpath)
    |> Enum.all?(fn {x, y} -> evaluate(game_new, x, trace) == evaluate(game_new, y, trace) || y == "*" end)
  end

  def message_list_to_string(game, statements, trace) do
    Enum.reduce(Enum.with_index(statements), "", fn({statement, index}, acc) ->
      str_statement = inspect(evaluate(game, statement, trace ++ ["statement #{index}"]))
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


  def evaluate_with_timeout(game, code, trace, timeout_ms \\ 500) do
    task = Task.async(fn ->
      try do
        evaluate(game, code, trace)
      rescue
        e in RuntimeError ->
          evaluate(game, ["ERROR", "Error: #{e.message}. #{inspect(trace)}"], trace)
      end
    end)

    case Task.yield(task, timeout_ms) do
      nil ->
        Task.shutdown(task, :brutal_kill)
        evaluate(game, ["ERROR", "Error: Action timed out."], trace)
      {:ok, result} ->
        result
    end
  end

  def evaluate(game, code, trace \\ []) do
    # IO.puts("evaluate 1")
    # IO.inspect(code)
    # IO.inspect(trace)

    if is_list(code) && Enum.count(code) > 0 do

      if is_list(Enum.at(code, 0)) do

        Enum.reduce(Enum.with_index(code), game, fn({action, index}, acc) ->
          evaluate(acc, action, trace ++ ["index #{index}"])
        end)

      else

        case Enum.at(code,0) do
          "PREV" ->
            evaluate(game["prev_game"], Enum.at(code, 1), trace ++ ["PREV"])

          "LOG_DEV" ->
            IO.puts("LOG_DEV:")
            IO.inspect(Enum.at(code, 1))
            IO.inspect(evaluate(game, Enum.at(code, 1), trace ++ ["LOG_DEV"]))
            game

          "ERROR" ->
            Logger.error(Enum.at(code, 1))
            evaluate(game, ["LOG", Enum.at(code, 1)], trace ++ ["ERROR"])

          "DEFINE" ->
            var_name = Enum.at(code, 1)
            value = evaluate(game, Enum.at(code, 2), trace ++ ["DEFINE #{var_name}"])
            #IO.puts("DEFINE #{var_name}")
            #IO.inspect(value)
            put_in(game, ["variables", var_name], value)

          "POINTER" ->
            Enum.at(code, 1)

          "LIST" ->
            list = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce(Enum.with_index(list), [], fn({item, index}, acc)->
              acc ++ [evaluate(game, item, trace ++ ["LIST index #{index}"])]
            end)

          "APPEND" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["APPEND left"]) || []
            list ++ [evaluate(game, Enum.at(code, 2), trace ++ ["APPEND right"])]

          "NEXT_PLAYER" ->
            current_player_i = evaluate(game, Enum.at(code, 1), trace ++ ["current_player_i"])
            current_i = String.to_integer(String.slice(current_player_i, -1..-1))
            next_i = current_i + 1
            next_i = if next_i > game["numPlayers"] do 1 else next_i end
            "player" <> Integer.to_string(next_i)

          "GET_INDEX" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["GET_INDEX list"])
            value = evaluate(game, Enum.at(code, 2), trace ++ ["GET_INDEX value"])
            Enum.find_index(list, fn(x) -> x == value end)

          "AT_INDEX" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["AT_INDEX list"])
            index = evaluate(game, Enum.at(code, 2), trace ++ ["AT_INDEX index"])
            if list do Enum.at(list, index) else nil end

          "LENGTH" ->
            Enum.count(evaluate(game, Enum.at(code,1), trace ++ ["LENGTH"]))

          "AND" ->
            statements = Enum.slice(code, 1, Enum.count(code) - 1)
            Enum.all?(Enum.with_index(statements), fn {statement, index} ->
              evaluate(game, statement, trace ++ ["AND index #{index}"])
            end)

          "OR" ->
            statements = Enum.slice(code, 1, Enum.count(code) - 1)
            Enum.any?(Enum.with_index(statements), fn {statement, index} ->
              evaluate(game, statement, trace ++ ["OR index #{index}"])
            end)

          "EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["EQUAL left"]) == evaluate(game, Enum.at(code,2), trace ++ ["EQUAL right"])

          "NOT_EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["NOT_EQUAL left"]) != evaluate(game, Enum.at(code,2), trace ++ ["NOT_EQUAL right"])

          "LESS_THAN" ->
            evaluate(game, Enum.at(code,1), trace ++ ["LESS_THAN left"]) < evaluate(game, Enum.at(code,2), trace ++ ["LESS_THAN right"])

          "GREATER_THAN" ->
            evaluate(game, Enum.at(code,1), trace ++ ["GREATER_THAN left"]) > evaluate(game, Enum.at(code,2), trace ++ ["GREATER_THAN right"])

          "LESS_EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["LESS_EQUAL left"]) <= evaluate(game, Enum.at(code,2), trace ++ ["LESS_EQUAL right"])

          "GREATER_EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["GREATER_EQUAL left"]) >= evaluate(game, Enum.at(code,2), trace ++ ["GREATER_EQUAL right"])

          "NOT" ->
            !evaluate(game, Enum.at(code,1), trace ++ ["NOT"])

          "JOIN_STRING" ->
            evaluate(game, Enum.at(code,1), trace ++ ["JOIN_STRING_left"]) <> evaluate(game, Enum.at(code,2), trace ++ ["JOIN_STRING_right"])

          "IN_STRING" ->
            String.contains?(evaluate(game, Enum.at(code,1), trace ++ ["IN_STRING container"]), evaluate(game, Enum.at(code,2), trace ++ ["IN_STRING substring"]))

          "IN_LIST" ->
            list = evaluate(game, Enum.at(code,1), trace ++ ["IN_LIST list"]) || []
            Enum.member?(list, evaluate(game, Enum.at(code,2), trace ++ ["IN_LIST member"]))

          "REMOVE_FROM_LIST_BY_VALUE" ->
            list = evaluate(game, Enum.at(code,1), trace ++ ["IN_LIST REMOVE_FROM_LIST_BY_VALUE list"]) || []
            value = evaluate(game, Enum.at(code,2), trace ++ ["IN_LIST REMOVE_FROM_LIST_BY_VALUE value"])
            Enum.filter(list, fn(x) -> x != value end)

          "ADD" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["ADD left"]) || 0) + (evaluate(game, Enum.at(code,2), trace ++ ["ADD right"]) || 0)

          "SUBTRACT" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["SUBTRACT left"]) || 0) - (evaluate(game, Enum.at(code,2), trace ++ ["SUBTRACT right"]) || 0)

          "MULTIPLY" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["MULTIPLY left"]) || 0) * (evaluate(game, Enum.at(code,2), trace ++ ["MULTIPLY right"]) || 0)

          "DIVIDE" ->
            divisor = (evaluate(game, Enum.at(code,2), trace ++ ["DIVIDE divisor"]) || 0)
            if divisor do (evaluate(game, Enum.at(code,1), trace ++ ["DIVIDE dividend"]) || 0) / divisor else nil end

          "RANDOM_INT" ->
            mn = evaluate(game, Enum.at(code,1), trace ++ ["RANDOM_INT min"])
            mx = evaluate(game, Enum.at(code,2), trace ++ ["RANDOM_INT max"])
            Enum.random(mn, mx)

          "OBJ_GET_VAL" ->
            map = evaluate(game, Enum.at(code,1), trace ++ ["OBJ_GET_VAL map"])
            key = evaluate(game, Enum.at(code,2), trace ++ ["OBJ_GET_VAL key"])
            map[key]

          "OBJ_GET_BY_PATH" ->
            map = evaluate(game, Enum.at(code,1), trace ++ ["OBJ_GET_BY_PATH map"])
            path = evaluate(game, Enum.at(code,2), trace ++ ["OBJ_GET_BY_PATH path"])
            Enum.reduce(Enum.with_index(path), map, fn({pathi, index}, acc) ->
              cond do
                String.starts_with?(pathi, "[") and String.ends_with?(pathi, "]") ->
                  int_str = evaluate(game, String.slice(pathi,1..-2), trace ++ ["OBJ_GET_BY_PATH index #{index}"])
                  int = convert_to_integer(int_str)
                  Enum.at(acc, int)
                pathi == "currentFace" ->
                  acc["sides"][acc["currentSide"]]
                pathi == "stackParentCard" ->
                  game["cardById"][acc["stackParentCardId"]]
                Map.has_key?(acc, pathi) ->
                  Map.get(acc, evaluate(game, pathi, trace ++ ["OBJ_GET_BY_PATH key #{index}"]))
                true ->
                  nil
              end
            end)

          "GAME_GET_VAL" ->
            path = evaluate(game, Enum.at(code,1), trace ++ ["GAME_GET_VAL path"])
            get_in(game, path)

          "GET_STACK_ID" ->
            group_id = evaluate(game, Enum.at(code,1), trace ++ ["GET_STACK_ID group_id"])
            stack_index = evaluate(game, Enum.at(code,2), trace ++ ["GET_STACK_ID stack_index"])
            if group_id do evaluate(game, ["AT_INDEX", "$GAME.groupById." <> group_id <> ".stackIds", stack_index], trace) else nil end

          "GET_CARD_ID" ->
            group_id = evaluate(game, Enum.at(code,1), trace ++ ["GET_CARD_ID group_id"])
            stack_index = evaluate(game, Enum.at(code,2), trace ++ ["GET_CARD_ID stack_index"])
            stack_id = evaluate(game, ["GET_STACK_ID", group_id, stack_index], trace ++ ["GET_CARD_ID stack_id"])
            card_index = evaluate(game, Enum.at(code,3), trace ++ ["GET_CARD_ID card_index"])
            if stack_id do evaluate(game, ["AT_INDEX", "$GAME.stackById." <> stack_id <> ".cardIds", card_index], trace) else nil end

          "OBJ_SET_VAL" ->
            case Enum.count(code) do
              4 ->
                obj = evaluate(game, Enum.at(code,1), trace ++ ["OBJ_SET_VAL obj"])
                key = evaluate(game, Enum.at(code,2), trace ++ ["OBJ_SET_VAL key"])
                value = evaluate(game, Enum.at(code,3), trace ++ ["OBJ_SET_VAL value"])
                put_in(obj[key], value)
              5 ->
                obj = evaluate(game, Enum.at(code,1), trace ++ ["OBJ_SET_VAL obj"])
                path = evaluate(game, Enum.at(code,2), trace ++ ["OBJ_SET_VAL path"])
                key = evaluate(game, Enum.at(code,3), trace ++ ["OBJ_SET_VAL key"])
                value = evaluate(game, Enum.at(code,4), trace ++ ["OBJ_SET_VAL value"])
                put_in(obj, path ++ [key], value)
            end

          "SET" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["SET path"])
            value = evaluate(game, Enum.at(code, 2), trace ++ ["SET value"])
            put_by_path(game, path, value, trace ++ ["SET put_by_path"])

          "UPDATE_ROOM_NAME" ->
            name = evaluate(game, Enum.at(code, 1), trace ++ ["UPDATE_ROOM_NAME name"])
            Rooms.update_room_name_by_slug(game["roomSlug"], name)
            evaluate(game, ["SET", "/roomName", name], trace)

          "INCREASE_VAL" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["INCREASE_VAL path"])
            delta = evaluate(game, Enum.at(code, 2), trace ++ ["INCREASE_VAL delta"])
            old_value = get_in(game, path) || 0
            put_by_path(game, path, old_value + delta, trace ++ ["INCREASE_VAL put_by_path"])

          "DECREASE_VAL" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["DECREASE_VAL path"])
            delta = evaluate(game, Enum.at(code, 2), trace ++ ["DECREASE_VAL delta"])
            old_value = get_in(game, path) || 0
            put_by_path(game, path, old_value - delta, trace ++ ["DECREASE_VAL put_by_path"])

          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(0..Enum.count(ifthens)-1//2, game, fn(i, _acc) ->
              if evaluate(game, Enum.at(ifthens, i), trace ++ ["COND index #{i} (if)"]) == true do
                {:halt, evaluate(game, Enum.at(ifthens, i+1), trace ++ ["COND index #{i} (then)"])}
              else
                {:cont, game}
              end
            end)

          "LOG" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = message_list_to_string(game, statements, trace ++ ["LOG message_list_to_string"])
            put_in(game["messages"], game["messages"] ++ [message])

          "FOR_EACH_START_STOP_STEP" ->
            var_name = Enum.at(code, 1)
            start = evaluate(game, Enum.at(code, 2), trace ++ ["FOR_EACH_START_STOP_STEP start"])
            stop = evaluate(game, Enum.at(code, 3), trace ++ ["FOR_EACH_START_STOP_STEP stop"])
            step = evaluate(game, Enum.at(code, 4), trace ++ ["FOR_EACH_START_STOP_STEP step"])
            function = Enum.at(code, 5)
            Enum.reduce(start..stop-1//step, game, fn(i, acc) ->
              acc = put_in(acc, ["variables", var_name], i)
              evaluate(acc, function, trace ++ ["FOR_EACH_START_STOP_STEP index #{i}"])
            end)

          "FOR_EACH_KEY_VAL" ->
            argc = Enum.count(code) - 1
            key_name = Enum.at(code, 1)
            val_name = Enum.at(code, 2)
            old_list = evaluate(game, Enum.at(code, 3), trace ++ ["FOR_EACH_KEY_VAL old_list"])
            function = Enum.at(code, 4)
            old_list = if argc >= 5 do
              order = if argc >= 6 and evaluate(game, Enum.at(code, 6), trace ++ ["FOR_EACH_KEY_VAL sort order"]) == "DESC" do :desc else :asc end
              Enum.sort_by(old_list, fn({_key, obj}) -> get_in(obj, evaluate(game, Enum.at(code, 5), trace ++ ["FOR_EACH_KEY_VAL sort prop"])) end, order)
            else
              old_list
            end
            Enum.reduce(old_list, game, fn({key, val}, acc) ->
              acc = put_in(acc, ["variables", key_name], key)
              acc = put_in(acc, ["variables", val_name], val)
              evaluate(acc, function, trace ++ ["FOR_EACH_KEY_VAL key #{key}"])
            end)

          "FOR_EACH_VAL" ->
            val_name = Enum.at(code, 1)
            list = evaluate(game, Enum.at(code, 2), trace ++ ["FOR_EACH_VAL list"])
            function = Enum.at(code, 3)
            Enum.reduce(Enum.with_index(list), game, fn({val, index}, acc) ->
              acc = put_in(acc, ["variables", val_name], val)
              evaluate(acc, function, trace ++ ["FOR_EACH_VAL index #{index}"])
            end)

          "MOVE_CARD" ->
            IO.puts("MOVE_CARD" <> inspect(code))
            argc = Enum.count(code) - 1
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["MOVE_CARD card_id"])
            if card_id do
              dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["MOVE_CARD dest_group_id"])
              dest_stack_index = evaluate(game, Enum.at(code, 3), trace ++ ["MOVE_CARD dest_stack_index"])
              dest_card_index = if argc >= 4 do evaluate(game, Enum.at(code, 4), trace ++ ["MOVE_CARD dest_stack_index"]) else 0 end
              combine = if argc >= 5 do evaluate(game, Enum.at(code, 5), trace ++ ["MOVE_CARD combine"]) else false end
              try do
                GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine)
              rescue
                e ->
                  raise("Failed to move card #{card_id} to dest_group_id:#{dest_group_id} dest_stack_index:#{dest_stack_index} dest_card_index:#{dest_card_index} combine:#{combine}. " <> inspect(e) <> inspect(trace))
              end

            else
              game
            end

          "LOAD_CARDS" ->
            load_list = evaluate(game, Enum.at(code, 1), trace ++ ["LOAD_CARDS load_list"])
            # If load_list is a string, it's a preBuiltDeckId - get the list from game_def
            load_list = if is_binary(load_list) do
              load_list_id = load_list
              game_def = Plugins.get_game_def(game["options"]["pluginId"])
              get_in(game_def, ["preBuiltDecks", load_list_id, "cards"])
            else
              load_list
            end
            try do
              GameUI.load_cards(game, evaluate(game, "$PLAYER_N", trace), load_list)
            rescue
              e ->
                exception = Exception.format(:error, e, __STACKTRACE__)
                # Loop over rows in exception and truncate rows that are over 200 characters
                exception = exception |> String.split("\n") |> Enum.map(fn(row) -> if String.length(row) > 200 do String.slice(row, 0, 200) <> "..." else row end end) |> Enum.join("\n")

                raise("Failed to load cards. " <> exception <> inspect(trace))
            end


          "DELETE_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["DELETE_CARD card_id"])
            try do
              GameUI.delete_card(card_id)
            rescue
              e ->
                raise("Failed to delete card #{card_id}. " <> inspect(e) <> inspect(trace))
            end

          "ATTACH_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["ATTACH_CARD card_id"])
            dest_card_id = evaluate(game, Enum.at(code, 2), trace ++ ["ATTACH_CARD dest_card_id"])
            dest_card = game["cardById"][dest_card_id]
            try do
              GameUI.move_card(game, card_id, dest_card["groupId"], dest_card["stackIndex"], -1, true)
            rescue
              e ->
                raise("Failed to attach card #{card_id} to dest_card_id:#{dest_card_id}. " <> inspect(e) <> inspect(trace))
            end

          "DRAW_CARD" ->
            argc = Enum.count(code) - 1
            num = if argc == 0 do 1 else evaluate(game, Enum.at(code, 1), trace ++ ["DRAW_CARD num"]) end
            player_n = game["playerUi"]["playerN"]
            try do
              GameUI.move_stacks(game, player_n <> "Deck", player_n <> "Hand", num, "bottom")
            rescue
              e ->
                raise("Failed to draw #{num} card(s). " <> inspect(e) <> " " <> inspect(trace))
            end

          "MOVE_STACK" ->
            argc = Enum.count(code) - 1
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["MOVE_STACK stack_id"])
            dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["MOVE_STACK dest_group_id"])
            dest_stack_index = evaluate(game, Enum.at(code, 3), trace ++ ["MOVE_STACK dest_stack_index"])
            combine = if argc >= 4 do evaluate(game, Enum.at(code, 4), trace ++ ["MOVE_STACK combine"] ) else nil end
            try do
              GameUI.move_stack(game, stack_id, dest_group_id, dest_stack_index, combine)
            rescue
              e ->
                raise("Failed to move stack #{stack_id} to dest_group_id:#{dest_group_id} dest_stack_index:#{dest_stack_index} combine:#{combine}. " <> inspect(e) <> inspect(trace))
            end

          "DISCARD_STACK" ->
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["DISCARD_STACK stack_id"])
            stack = game["stackById"][stack_id]
            card_ids = stack["cardIds"]
            Enum.reduce(card_ids, game, fn(card_id, acc) ->
              evaluate(acc, ["DISCARD_CARD", card_id], trace)
            end)

          "MOVE_STACKS" ->
            orig_group_id = evaluate(game, Enum.at(code, 1), trace ++ ["MOVE_STACKS orig_group_id"])
            dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["MOVE_STACKS dest_group_id"])
            top_n = evaluate(game, Enum.at(code, 3), trace ++ ["MOVE_STACKS top_n"])
            position = evaluate(game, Enum.at(code, 4), trace ++ ["MOVE_STACKS position"])
            try do
              GameUI.move_stacks(game, orig_group_id, dest_group_id, top_n, position)
            rescue
              e ->
                raise("Failed to move top #{top_n} stacks from #{orig_group_id} to #{dest_group_id}:#{position}." <> inspect(e) <> inspect(trace))
            end

          "SHUFFLE_GROUP" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["SHUFFLE_GROUP group_id"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            shuffled_stack_ids = stack_ids |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], shuffled_stack_ids)

          "SHUFFLE_TOP_X" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["SHUFFLE_TOP_X group_id"])
            x = evaluate(game, Enum.at(code, 2), trace ++ ["SHUFFLE_TOP_X x"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_l = Enum.slice(stack_ids, 0, x)
            stack_ids_r = Enum.slice(stack_ids, x, Enum.count(stack_ids))
            stack_ids_l = stack_ids_l |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "SHUFFLE_BOTTOM_X" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["SHUFFLE_BOTTOM_X group_id"])
            x = evaluate(game, Enum.at(code, 2), trace ++ ["SHUFFLE_BOTTOM_X x"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_r = Enum.slice(stack_ids, -x, x)
            stack_ids_l = Enum.slice(stack_ids, 0, Enum.count(stack_ids) - x)
            stack_ids_r = stack_ids_r |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "FACEUP_NAME_FROM_STACK_ID" ->
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["FACEUP_NAME_FROM_STACK_ID stack_id"])
            card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)
            evaluate(game, ["FACEUP_NAME_FROM_CARD_ID", card_id], trace ++ ["FACEUP_NAME_FROM_STACK_ID"])

          "FACEUP_NAME_FROM_CARD_ID" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["FACEUP_NAME_FROM_CARD_ID card_id"])
            card = game["cardById"][card_id]
            face = card["sides"][card["currentSide"]]
            face["name"]

          "ONE_CARD" ->
            var_name = Enum.at(code, 1)
            one_card = Enum.find(Map.values(game["cardById"]), fn(card) ->
              game = evaluate(game, ["DEFINE", var_name, card], trace ++ ["ONE_CARD"])
              evaluate(game, Enum.at(code, 2), trace ++ ["ONE_CARD condition"])
            end)
            one_card

          "ACTION_LIST" ->
            argc = Enum.count(code) - 1
            action_list_id = evaluate(game, Enum.at(code, 1), trace ++ ["ACTION_LIST action_list_id"])
            game_def = Plugins.get_game_def(game["options"]["pluginId"])
            action_list = game_def["actionLists"][action_list_id]
            case argc do
              1 ->
                evaluate(game, action_list, trace ++ ["ACTION_LIST #{action_list_id}"])
              2 ->
                active_card_id = evaluate(game, Enum.at(code, 2), trace ++ ["ACTION_LIST active_card_id"])
                game = put_in(game, ["playerUi", "activeCardId"], active_card_id)
                evaluate(game, action_list, trace ++ ["ACTION_LIST #{action_list_id} active_card_id #{active_card_id}"])
              3 ->
                active_card_id = evaluate(game, Enum.at(code, 2), trace ++ ["ACTION_LIST active_card_id"])
                player_n = evaluate(game, Enum.at(code, 3), trace ++ ["ACTION_LIST player_n"])
                game = put_in(game, ["playerUi", "activeCardId"], active_card_id)
                game = put_in(game, ["playerUi", "playerN"], player_n)
                evaluate(game, action_list, trace ++ ["ACTION_LIST #{action_list_id} active_card_id #{active_card_id} player_n #{player_n}"])
              _ ->
                game
            end
          _ ->
            raise "Command #{Enum.at(code,0)} not recognized in #{inspect(code)}"
        end
      end
    else # value
      trace ++ [code]
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
          active_card = evaluate(game, "$ACTIVE_CARD", trace)
          evaluate(game, "$ACTIVE_CARD_PATH", trace) ++ ["sides", active_card["currentSide"]]

        code == "$ACTIVE_TOKENS_PATH" ->
          evaluate(game, "$ACTIVE_CARD_PATH", trace) ++ ["tokens"]

        code == "$ACTIVE_CARD" ->
          get_in(game, evaluate(game, "$ACTIVE_CARD_PATH", trace))

        code == "$ACTIVE_CARD_ID" ->
          evaluate(game, "$ACTIVE_CARD.id", trace)

        code == "$ACTIVE_FACE" ->
          get_in(game, evaluate(game, "$ACTIVE_FACE_PATH", trace))

        code == "$ACTIVE_TOKENS" ->
          get_in(game, evaluate(game, "$ACTIVE_TOKENS_PATH", trace))

        is_binary(code) and String.starts_with?(code, "$") and String.contains?(code, ".") ->
          split = String.split(code, ".")
          obj = evaluate(game, Enum.at(split, 0), trace)
          path = ["LIST"] ++ Enum.slice(split, 1, Enum.count(split))
          evaluate(game, ["OBJ_GET_BY_PATH", obj, path], trace)

        is_binary(code) and String.starts_with?(code, "$") ->
          if Map.has_key?(game, "variables") && Map.has_key?(game["variables"], code) do
            game["variables"][code]
          else
            # Join trace together with a comma
            raise "Variable #{code} not found. " <> inspect(trace)
          end

        is_binary(code) and String.starts_with?(code, "/") ->
          split = String.split(code, "/")
          path = ["LIST"] ++ Enum.slice(split, 1, Enum.count(split))
          List.flatten(evaluate(game, path, trace))

        true ->
          code
      end
    end
  end
end
