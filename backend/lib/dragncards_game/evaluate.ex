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
    path_minus_key = try do
      Enum.slice(path, 0, Enum.count(path)-1)
    rescue
      _ ->
        raise "Tried to set a value (#{val_new}) at a nonexistent path: #{inspect(path)}. #{inspect(trace)}"
    end
    key = Enum.at(path, -1)
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
            raise("Tried to set a key (#{key}) at a nonexistent path: #{inspect(path_minus_key)}")

          val_old ->
            # Check if val_old is a map
            if is_map(val_old) do
              put_in(game_old, path, val_new)
            else
              raise("Tried to set a key (#{key}) at a path that does not point to a map: #{inspect(path_minus_key)} = #{inspect(val_old)}")
            end
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
      comment = rule["_comment"]
      case rule["type"] do
        "trigger" ->
          apply_trigger_rule(rule, game_old, game_new, trace ++ ["apply_trigger_rule #{comment}"])
        "passive" ->
          apply_passive_rule(rule, game_old, game_new, trace ++ ["apply_passive_rule #{comment}"])
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
      eval_statement = evaluate(game, statement, trace ++ ["statement #{index}"])
      str_statement = inspect(eval_statement) |> String.replace("\"","")
      acc <> str_statement
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

  def while_loop(game, condition, action_list, trace, index) do
    if evaluate(game, condition, trace ++ ["WHILE condition"]) == true do
      game = evaluate(game, action_list, trace ++ ["WHILE index #{index}"])
      while_loop(game, condition, action_list, trace, index + 1)
    else
      game
    end
  end

  def card_match?(game, var_name, card, condition, trace) do
    game = evaluate(game, ["VAR", var_name, card], trace ++ ["VAR var_name"])
    evaluate(game, condition, trace ++ ["card_match?"])
  end

  @spec find_var(String.t(), integer(), map()) :: {:found, any()} | {:not_found, nil}
  def find_var(key, start_integer, input_map) do
    #IO.puts("Searching for var #{key} in #{inspect(input_map)}")
    1..start_integer
    |> Enum.reverse()
    |> Enum.reduce_while(nil, fn i, _acc ->
      case Map.fetch(input_map["#{i}"], key) do
        :error -> {:cont, {false, nil}}
        {:ok, value} -> {:halt, {true, value}}
      end
    end)
    |> case do
      {false, nil} -> # Not in local scopes, check global scope
        case Map.fetch(input_map, key) do
          :error -> {false, nil}
          {:ok, value} -> {true, value}
        end
      found -> found # Found in local scopes
    end
  end

  def find_var_scope_index(key, start_integer, input_map) do
    #IO.puts("Searching for var #{key} in #{inspect(input_map)}")
    1..start_integer
    |> Enum.reverse()
    |> Enum.reduce_while(nil, fn i, _acc ->
      case Map.fetch(input_map["#{i}"], key) do
        :error -> {:cont, {false, nil}}
        {:ok, _} -> {:halt, i}
      end
    end)
    |> case do
      {false, nil} -> # Not in local scopes, check global scope
        raise "Tried to access variable #{key} but it was not found in any scope."
      found -> found # Found in local scopes
    end
  end

  def get_lhs_rhs(game, code, trace) do
    lhs = evaluate(game, Enum.at(code,1), trace ++ ["evaluate lhs"]) || 0
    rhs = evaluate(game, Enum.at(code,2), trace ++ ["evaluate rhs"]) || 0
    # If lhs or rhs is not a number, raise an error
    if is_number(lhs) and is_number(rhs) do
      {lhs, rhs}
    else
      raise "Tried to compare #{inspect(lhs)} and #{inspect(rhs)} but one of them is not a number."
    end
  end

  def evaluate_with_timeout(game, code, timeout_ms \\ 35_000) do
    trace = [code]
    task = Task.async(fn ->
      try do
        evaluate(game, code, trace)
      rescue
        e in RuntimeError ->
          evaluate(game, ["ERROR", e.message], trace)
      end
    end)

    case Task.yield(task, timeout_ms) do
      nil ->
        Task.shutdown(task, :brutal_kill)
        evaluate(game, ["ERROR", "Action timed out."], trace)
      {:ok, result} ->
        result
    end
  end

  def evaluate(game, code, trace \\ []) do
    #if is_list(code) do IO.inspect(code) end
    try do

      current_scope_index = game["currentScopeIndex"] + 1
      game = put_in(game, ["currentScopeIndex"], current_scope_index)
      game = if not Map.has_key?(game["variables"], "#{current_scope_index}") do
        put_in(game, ["variables", "#{current_scope_index}"], %{})
      else
        game
      end

      result = evaluate_inner(game, code, trace)

      # Delete local variables
      if is_map(result) and Map.has_key?(result, "variables") do
        #IO.inspect(result["variables"])
        #IO.puts("Deleting variable #{current_scope_index+1} from #{inspect(result["variables"])}")
        result = if Map.has_key?(result["variables"], "#{current_scope_index+1}") do
          put_in(result, ["variables"], Map.delete(result["variables"], "#{current_scope_index+1}"))
        else
          result
        end
        #IO.puts("resulting variables after #{inspect(code)}: #{inspect(result["variables"])}")
        put_in(result, ["currentScopeIndex"], current_scope_index - 1)
      else
        result
      end


    rescue
      e in RuntimeError ->
        if String.starts_with?(e.message, ":") do
          raise e.message
        else
          raise ": #{e.message} Trace: #{inspect(trace)}"
        end
          #evaluate(game, ["ERROR", e.message], trace)
    end
  end

  def evaluate_inner(game, code, trace) do
    #IO.puts("evaluate_inner 1")
    #IO.inspect(code)
    current_scope_index = game["currentScopeIndex"]


    if is_list(code) && Enum.count(code) > 0 do

      if is_list(Enum.at(code, 0)) do
        # Nested actionList
        # Update currentScopeIndex

        result = Enum.reduce(Enum.with_index(code), game, fn({action, index}, acc) ->
          evaluate(acc, action, trace ++ ["index #{index}"])
        end)

      else
        #IO.inspect(code)
        function_name = Enum.at(code, 0)
        trace == trace ++ function_name
        case function_name do
          "PREV" ->
            prev_game = game["prev_game"]
            |> Map.put("variables", game["variables"])
            |> put_in(["variables", "$TARGET"], game["prev_game"]["variables"]["$TARGET"])
            |> put_in(["variables", "$TARGET_ID"], game["prev_game"]["variables"]["$TARGET_ID"])
            |> put_in(["variables", "$THIS"], game["prev_game"]["variables"]["$THIS"])
            |> put_in(["variables", "$THIS_ID"], game["prev_game"]["variables"]["$THIS_ID"])
            evaluate(prev_game, Enum.at(code, 1), trace)

          "LOG_DEV" ->
            IO.puts("LOG_DEV #{current_scope_index}:")
            IO.inspect(Enum.at(code, 1))
            IO.inspect(evaluate(game, Enum.at(code, 1), trace))
            game

          "ERROR" ->
            Logger.error("in #{game["pluginName"]}#{Enum.at(code, 1)}")
            evaluate(game, ["LOG", Enum.at(code, 1)], trace)

          "DEFINE" ->
            # Evaluate the value and assign it to the var name
            var_name = Enum.at(code, 1)
            # if var_name does not start with $, raise an error
            if String.starts_with?(var_name, "$") do
              value = evaluate(game, Enum.at(code, 2), trace ++ ["#{var_name}"])
              put_in(game, ["variables", var_name], value)
            else
              raise "Tried to define variable '#{var_name}' but it does not start with $."
            end

          "VAR" ->
            # Evaluate the value and assign it to the var name
            var_name = Enum.at(code, 1)
            # if var_name does not start with $, raise an error
            if String.starts_with?(var_name, "$") do
              value = evaluate(game, Enum.at(code, 2), trace ++ ["#{var_name}"])
              put_in(game, ["variables", "#{current_scope_index}", var_name], value)
            else
              raise "Tried to define variable '#{var_name}' but it does not start with $."
            end

          "UPDATE_VAR" ->
            # Evaluate the value and assign it to the var name
            var_name = Enum.at(code, 1)
            # if var_name does not start with $, raise an error
            if String.starts_with?(var_name, "$") do
              var_scope_index = find_var_scope_index(var_name, current_scope_index, game["variables"])
              value = evaluate(game, Enum.at(code, 2), trace ++ ["#{var_name}"])
              put_in(game, ["variables", "#{var_scope_index}", var_name], value)
            else
              raise "Tried to update variable '#{var_name}' but it does not start with $."
            end

          "INCREASE_VAR" ->
            # Evaluate the value and assign it to the var name
            var_name = Enum.at(code, 1)
            # if var_name does not start with $, raise an error
            if String.starts_with?(var_name, "$") do
              var_scope_index = find_var_scope_index(var_name, current_scope_index, game["variables"])
              current_value = game["variables"]["#{var_scope_index}"][var_name] || 0
              delta = evaluate(game, Enum.at(code, 2), trace ++ [var_name]) || 0
              put_in(game, ["variables", "#{var_scope_index}", var_name], current_value + delta)
            else
              raise "Tried to update variable '#{var_name}' but it does not start with $."
            end

          "DECREASE_VAR" ->
            # Evaluate the value and assign it to the var name
            var_name = Enum.at(code, 1)
            # if var_name does not start with $, raise an error
            if String.starts_with?(var_name, "$") do
              var_scope_index = find_var_scope_index(var_name, current_scope_index, game["variables"])
              current_value = game["variables"]["#{var_scope_index}"][var_name] || 0
              delta = evaluate(game, Enum.at(code, 2), trace ++ [var_name]) || 0
              put_in(game, ["variables", "#{var_scope_index}", var_name], current_value - delta)
            else
              raise "Tried to update variable '#{var_name}' but it does not start with $."
            end

          "DEFINED" ->
            var_name = Enum.at(code, 1)
            try do
              result = evaluate_inner(game, var_name, trace ++ ["#{var_name}"])
              result != nil
            rescue
              _ -> false
            end

          "FUNCTION" ->
            new_func_name = Enum.at(code, 1)
            # if func_name is not all caps, raise an error
            if String.upcase(new_func_name) == new_func_name do
              new_func_args = Enum.slice(code, 2, Enum.count(code) - 3)
              new_func_code = Enum.at(code, -1)
              put_in(game, ["functions", new_func_name], %{"args" => new_func_args, "code" => new_func_code})
            else
              raise "Tried to define function '#{new_func_name}' but it is not all caps."
            end

          "POINTER" ->
            Enum.at(code, 1)

          "LIST" ->
            list = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce(Enum.with_index(list), [], fn({item, index}, acc)->
              acc ++ [evaluate(game, item, trace ++ ["index #{index}"])]
            end)

          "APPEND" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["left"]) || []
            list ++ [evaluate(game, Enum.at(code, 2), trace ++ ["right"])]

          "NEXT_PLAYER" ->
            current_player_i = evaluate(game, Enum.at(code, 1), trace ++ ["current_player_i"])
            current_i = String.to_integer(String.slice(current_player_i, -1..-1))
            next_i = current_i + 1
            next_i = if next_i > game["numPlayers"] do 1 else next_i end
            "player" <> Integer.to_string(next_i)

          "GET_INDEX" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["list"])
            value = evaluate(game, Enum.at(code, 2), trace ++ ["value"])
            Enum.find_index(list, fn(x) -> x == value end)

          "AT_INDEX" ->
            list = evaluate(game, Enum.at(code, 1), trace ++ ["list"])
            index = evaluate(game, Enum.at(code, 2), trace ++ ["index"])
            if list do Enum.at(list, index) else nil end

          "LENGTH" ->
            value = evaluate(game, Enum.at(code, 1), trace)
            if is_binary(value) do String.length(value) else Enum.count(value) end

          "AND" ->
            statements = Enum.slice(code, 1, Enum.count(code) - 1)
            Enum.all?(Enum.with_index(statements), fn {statement, index} ->
              evaluate(game, statement, trace ++ ["index #{index}"])
            end)

          "OR" ->
            statements = Enum.slice(code, 1, Enum.count(code) - 1)
            Enum.any?(Enum.with_index(statements), fn {statement, index} ->
              evaluate(game, statement, trace ++ ["index #{index}"])
            end)

          "TRUE" ->
            true

          "FALSE" ->
            false

          "EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["left"]) == evaluate(game, Enum.at(code,2), trace ++ ["right"])

          "NOT_EQUAL" ->
            evaluate(game, Enum.at(code,1), trace ++ ["left"]) != evaluate(game, Enum.at(code,2), trace ++ ["right"])

          "LESS_THAN" ->
            {lhs, rhs} = get_lhs_rhs(game, code, trace)
            lhs < rhs

          "GREATER_THAN" ->
            {lhs, rhs} = get_lhs_rhs(game, code, trace)
            lhs > rhs

          "LESS_EQUAL" ->
            {lhs, rhs} = get_lhs_rhs(game, code, trace)
            lhs <= rhs

          "GREATER_EQUAL" ->
            {lhs, rhs} = get_lhs_rhs(game, code, trace)
            lhs >= rhs

          "NOT" ->
            !evaluate(game, Enum.at(code,1), trace)

          "SUBSTRING" ->
            string = evaluate(game, Enum.at(code,1), trace ++ ["string"])
            start = evaluate(game, Enum.at(code,2), trace ++ ["start"])
            length = evaluate(game, Enum.at(code,3), trace ++ ["length"])
            String.slice(string, start..start+length-1)

          "JOIN_STRING" ->
            evaluate(game, Enum.at(code,1), trace ++ ["left"]) <> evaluate(game, Enum.at(code,2), trace ++ ["right"])

          "IN_STRING" ->
            container = evaluate(game, Enum.at(code,1), trace ++ ["container"])
            containee = evaluate(game, Enum.at(code,2), trace ++ ["containee"])
            if container == nil or containee == nil do
              false
            else
              String.contains?(container, containee)
            end

          "IN_LIST" ->
            list = evaluate(game, Enum.at(code,1), trace ++ ["list"]) || []
            Enum.member?(list, evaluate(game, Enum.at(code,2), trace ++ ["member"]))

          "REMOVE_FROM_LIST_BY_VALUE" ->
            list = evaluate(game, Enum.at(code,1), trace ++ ["list"]) || []
            value = evaluate(game, Enum.at(code,2), trace ++ ["value"])
            Enum.filter(list, fn(x) -> x != value end)

          "ADD" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) + (evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)

          "SUBTRACT" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) - (evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)

          "MULTIPLY" ->
            (evaluate(game, Enum.at(code,1), trace ++ ["left"]) || 0) * (evaluate(game, Enum.at(code,2), trace ++ ["right"]) || 0)

          "DIVIDE" ->
            divisor = (evaluate(game, Enum.at(code,2), trace ++ ["divisor"]) || 0)
            if divisor do (evaluate(game, Enum.at(code,1), trace ++ ["dividend"]) || 0) / divisor else nil end

          "RANDOM_INT" ->
            mn = evaluate(game, Enum.at(code,1), trace ++ ["min"])
            mx = evaluate(game, Enum.at(code,2), trace ++ ["max"])
            :rand.uniform(mx - mn + 1) + mn - 1

          "OBJ_GET_VAL" ->
            map = evaluate(game, Enum.at(code,1), trace ++ ["map"])
            key = evaluate(game, Enum.at(code,2), trace ++ ["key"])
            map[key]

          "OBJ_GET_BY_PATH" ->
            map = evaluate(game, Enum.at(code,1), trace ++ ["map"])
            path = evaluate(game, Enum.at(code,2), trace ++ ["path"])
            Enum.reduce(Enum.with_index(path), map, fn({pathi, index}, acc) ->
              cond do
                pathi == nil ->
                  raise "Tried to access nil in path #{inspect(path)}."
                String.starts_with?(pathi, "[") and String.ends_with?(pathi, "]") ->
                  int_str = evaluate(game, String.slice(pathi,1..-2), trace ++ ["index #{index}"])
                  int = convert_to_integer(int_str)
                  if acc == nil do
                    raise "Tried to access index #{int} on a null array."
                  end
                  if not is_list(acc) do
                    raise "Tried to access index #{int} on a non-array object."
                  end
                  if Enum.count(acc) <= int do
                    raise "Tried to access index #{int} on an array of length #{Enum.count(acc)}."
                  end
                  Enum.at(acc, int)
                pathi == "currentFace" ->
                  current_side = if acc["currentSide"] == nil do
                    raise "Tried to access currentFace on an object where currentSide is null."
                  else
                    acc["currentSide"]
                  end
                  sides = if acc["sides"] == nil do
                    raise "Tried to access sides on a non-card object."
                  else
                    acc["sides"]
                  end
                  if sides[current_side] == nil do
                    raise "Tried to access side #{current_side} on an object with sides #{inspect(Map.keys(sides))}."
                  else
                    sides[current_side]
                  end
                pathi == "stackParentCard" ->
                  game["cardById"][acc["stackParentCardId"]]
                pathi == "parentCardIds" ->
                  # Make sure there is a stackIds key
                  if Map.has_key?(acc, "stackIds") do
                    # Get the stackIds
                    stack_ids = acc["stackIds"]
                    # Return a list of the parent card ids
                    Enum.map(stack_ids, fn(stack_id) ->
                      # Get the stack
                      stack = game["stackById"][stack_id]
                      # Get the parent card id
                      Enum.at(stack["cardIds"], 0)
                    end)
                  else
                    raise "Tried to access parentCardIds on a non-group object."
                  end
                pathi == "parentCards" ->
                  # Make sure there is a stackIds key
                  if Map.has_key?(acc, "stackIds") do
                    # Get the stackIds
                    stack_ids = acc["stackIds"]
                    # Return a list of the parent card ids
                    Enum.map(stack_ids, fn(stack_id) ->
                      # Get the stack
                      stack = game["stackById"][stack_id]
                      # Get the parent card id
                      card_id = Enum.at(stack["cardIds"], 0)
                      game["cardById"][card_id]
                    end)
                  else
                    raise "Tried to access parentCards on a non-group object."
                  end
                acc == nil ->
                  nil
                Map.has_key?(acc, pathi) ->
                  Map.get(acc, evaluate(game, pathi, trace ++ ["key #{index}"]))
                true ->
                  nil
                  #raise "Tried to access #{pathi} on an object that doesn't have that key. Only keys are #{Map.keys(acc)}. #{inspect(trace)}"
              end
            end)

          "GET_STACK_ID" ->
            group_id = evaluate(game, Enum.at(code,1), trace ++ ["group_id"])
            stack_index = evaluate(game, Enum.at(code,2), trace ++ ["stack_index"])
            if group_id do evaluate(game, ["AT_INDEX", "$GAME.groupById." <> group_id <> ".stackIds", stack_index], trace) else nil end

          "GET_CARD_ID" ->
            group_id = evaluate(game, Enum.at(code,1), trace ++ ["group_id"])
            stack_index = evaluate(game, Enum.at(code,2), trace ++ ["stack_index"])
            stack_id = evaluate(game, ["GET_STACK_ID", group_id, stack_index], trace ++ ["stack_id"])
            card_index = evaluate(game, Enum.at(code,3), trace ++ ["card_index"])
            if stack_id do evaluate(game, ["AT_INDEX", "$GAME.stackById." <> stack_id <> ".cardIds", card_index], trace) else nil end

          "OBJ_SET_VAL" ->
            case Enum.count(code) do
              4 ->
                obj = evaluate(game, Enum.at(code,1), trace ++ ["obj"])
                key = evaluate(game, Enum.at(code,2), trace ++ ["key"])
                value = evaluate(game, Enum.at(code,3), trace ++ ["value"])
                put_in(obj[key], value)
              5 ->
                obj = evaluate(game, Enum.at(code,1), trace ++ ["obj"])
                path = evaluate(game, Enum.at(code,2), trace ++ ["path"])
                key = evaluate(game, Enum.at(code,3), trace ++ ["key"])
                value = evaluate(game, Enum.at(code,4), trace ++ ["value"])
                put_in(obj, path ++ [key], value)
            end

          "GET" ->
            path = evaluate(game, Enum.at(code,1), trace ++ ["path"])
            get_in(game, path)

          "SET" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["path"])
            value = evaluate(game, Enum.at(code, 2), trace ++ ["value"])
            put_by_path(game, path, value, trace ++ ["put_by_path"])

          "UNSET" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["path"])
            path_minus_key = Enum.slice(path, 0, Enum.count(path)-1)
            key_to_delete = Enum.at(path, -1)
            nested_map = get_in(game, path_minus_key)
            nested_map = Map.delete(nested_map, key_to_delete)
            put_in(game, path_minus_key, nested_map)

          "TARGET" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
            evaluate(game, ["SET", "/cardById/" <> card_id <> "/targeting/$PLAYER_N", true], trace ++ ["set"])

          "UPDATE_ROOM_NAME" ->
            name = evaluate(game, Enum.at(code, 1), trace ++ ["name"])
            Rooms.update_room_name_by_slug(game["roomSlug"], name)
            evaluate(game, ["SET", "/roomName", name], trace)

          "INCREASE_VAL" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["path"])
            delta = evaluate(game, Enum.at(code, 2), trace ++ ["delta"]) || 0
            old_value = get_in(game, path) || 0
            put_by_path(game, path, old_value + delta, trace ++ ["put_by_path"])

          "DECREASE_VAL" ->
            path = evaluate(game, Enum.at(code, 1), trace ++ ["path"])
            delta = evaluate(game, Enum.at(code, 2), trace ++ ["delta"])
            old_value = get_in(game, path) || 0
            put_by_path(game, path, old_value - delta, trace ++ ["put_by_path"])

          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(0..Enum.count(ifthens)-1//2, game, fn(i, _acc) ->
              if evaluate(game, Enum.at(ifthens, i), trace ++ ["index #{i} (if)"]) == true do
                {:halt, evaluate(game, Enum.at(ifthens, i+1), trace ++ ["index #{i} (then)"])}
              else
                {:cont, game}
              end
            end)

          "LOG" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = message_list_to_string(game, statements, trace ++ ["message_list_to_string"])
            put_in(game["messages"], game["messages"] ++ [message])

          "WHILE" ->
            condition = Enum.at(code, 1)
            action_list = Enum.at(code, 2)
            while_loop(game, condition, action_list, trace, 0)

          "FOR_EACH_START_STOP_STEP" ->
            var_name = Enum.at(code, 1)
            start = evaluate(game, Enum.at(code, 2), trace ++ ["start"])
            stop = evaluate(game, Enum.at(code, 3), trace ++ ["stop"])
            step = evaluate(game, Enum.at(code, 4), trace ++ ["step"])
            function = Enum.at(code, 5)
            game = Enum.reduce(start..stop-1//step, game, fn(i, acc) ->
              acc = evaluate(acc, ["VAR", var_name, i], trace ++ ["index #{i}"])
              evaluate(acc, function, trace ++ ["index #{i}"])
            end)
            # # Delete local variable
            # game
            # |> put_in(["variables"], Map.delete(game["variables"], "#{var_name}-#{current_scope_index}"))

          "FOR_EACH_KEY_VAL" ->
            argc = Enum.count(code) - 1
            key_name = Enum.at(code, 1)
            val_name = Enum.at(code, 2)
            old_list = evaluate(game, Enum.at(code, 3), trace ++ ["old_list"])
            function = Enum.at(code, 4)
            old_list = if argc >= 5 do
              order = if argc >= 6 and evaluate(game, Enum.at(code, 6), trace ++ ["sort order"]) == "DESC" do :desc else :asc end
              Enum.sort_by(old_list, fn({_key, obj}) -> get_in(obj, evaluate(game, Enum.at(code, 5), trace ++ ["sort prop"])) end, order)
            else
              old_list
            end
            game = Enum.reduce(old_list, game, fn({key, val}, acc) ->
              acc = evaluate(acc, ["VAR", key_name, key], trace ++ ["key #{key}"])
              acc = evaluate(acc, ["VAR", val_name, val], trace ++ ["val"])
              evaluate(acc, function, trace ++ ["key #{key}"])
            end)
            # # Delete local variables
            # game
            # |> put_in(["variables"], Map.delete(game["variables"], "#{key_name}-#{current_scope_index}"))
            # |> put_in(["variables"], Map.delete(game["variables"], "#{val_name}-#{current_scope_index}"))


          "FOR_EACH_VAL" ->
            val_name = Enum.at(code, 1)
            list = evaluate(game, Enum.at(code, 2), trace ++ ["list"])
            function = Enum.at(code, 3)
            game = Enum.reduce(Enum.with_index(list), game, fn({val, index}, acc) ->
              acc = evaluate(acc, ["VAR", val_name, val], trace ++ ["index #{index}"])
              evaluate(acc, function, trace ++ ["index #{index}"])
            end)
            # # Delete local variable
            # game
            # |> put_in(["variables"], Map.delete(game["variables"], "#{val_name}-#{current_scope_index}"))

          "MOVE_CARD" ->
            Logger.debug("MOVE_CARD " <> inspect(code))
            argc = Enum.count(code) - 1
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
            if card_id do
              dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
              dest_stack_index = evaluate(game, Enum.at(code, 3), trace ++ ["dest_stack_index"])
              dest_card_index = if argc >= 4 do evaluate(game, Enum.at(code, 4), trace ++ ["dest_stack_index"]) else 0 end
              options = if argc >= 5 do evaluate(game, Enum.at(code, 5), trace ++ ["options"]) else nil end
              GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, options)

            else
              game
            end

          "LOAD_CARDS" ->
            load_list_or_id = evaluate(game, Enum.at(code, 1), trace ++ ["load_list"])
            game_def = Plugins.get_game_def(game["options"]["pluginId"])

            # Set the load_list_id
            load_list_id = if is_list(load_list_or_id) do
              nil
            else
              load_list_or_id
            end

            # Set the load_list
            load_list = if is_list(load_list_or_id) do
              load_list_or_id
            else
              get_in(game_def, ["preBuiltDecks", load_list_id, "cards"])
            end

            # Run preLoadActionList if it exists
            game = if game_def["automation"]["preLoadActionList"] do
              evaluate(game, ["ACTION_LIST", game_def["automation"]["preLoadActionList"]], trace ++ ["game preLoadActionList"])
            else
              game
            end
            # Run deck's preLoadActionList if it exists
            game = if load_list_id && game_def["preBuiltDecks"][load_list_id]["preLoadActionList"] do
              evaluate(game, ["ACTION_LIST", game_def["preBuiltDecks"][load_list_id]["preLoadActionList"]], trace ++ ["deck preLoadActionList"])
            else
              game
            end

            prev_loaded_card_ids = game["loadedCardIds"]


            game = GameUI.load_cards(game, load_list)

            # Run deck's postLoadActionList if it exists
            game = if load_list_id && game_def["preBuiltDecks"][load_list_id]["postLoadActionList"] do
              evaluate(game, ["ACTION_LIST", game_def["preBuiltDecks"][load_list_id]["postLoadActionList"]], trace ++ ["deck postLoadActionList"])
            else
              game
            end

            # Run postLoadActionList if it exists
            game = if game_def["automation"]["postLoadActionList"] do
              evaluate(game, ["ACTION_LIST", game_def["automation"]["postLoadActionList"]], trace ++ ["game postLoadActionList"])
            else
              game
            end

            # Restore prev_loaded_card_ids
            game = put_in(game, ["loadedCardIds"], prev_loaded_card_ids)

            # Set loadedADeck to true
            put_in(game, ["loadedADeck"], true)

          "DELETE_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
            try do
              GameUI.delete_card(game, card_id)
            rescue
              e ->
                raise("Failed to delete card #{card_id}. " <> inspect(e) <> inspect(trace))
            end

          "ATTACH_CARD" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
            dest_card_id = evaluate(game, Enum.at(code, 2), trace ++ ["dest_card_id"])
            dest_card = game["cardById"][dest_card_id]
            try do
              GameUI.move_card(game, card_id, dest_card["groupId"], dest_card["stackIndex"], -1, %{"combine" => true})
            rescue
              e ->
                raise("Failed to attach card #{card_id} to dest_card_id:#{dest_card_id}. " <> inspect(e) <> inspect(trace))
            end

          "DRAW_CARD" ->
            argc = Enum.count(code) - 1
            num = if argc == 0 do 1 else evaluate(game, Enum.at(code, 1), trace ++ ["num"]) end
            player_n = evaluate(game, "$PLAYER_N", trace ++ ["player_n"])
            GameUI.move_stacks(game, player_n <> "Deck", player_n <> "Hand", num, "bottom")

          "MOVE_STACK" ->
            argc = Enum.count(code) - 1
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["stack_id"])
            dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
            dest_stack_index = evaluate(game, Enum.at(code, 3), trace ++ ["dest_stack_index"])
            options = if argc >= 4 do evaluate(game, Enum.at(code, 4), trace ++ ["options"] ) else nil end
            #try do
              GameUI.move_stack(game, stack_id, dest_group_id, dest_stack_index, options)
            #rescue
            #  e ->
            #    raise("Failed to move stack #{stack_id} to dest_group_id:#{dest_group_id} dest_stack_index:#{dest_stack_index}. " <> inspect(e) <> inspect(trace))
            #end

          "DISCARD_STACK" ->
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["DISCARD_STACK stack_id"])
            stack = game["stackById"][stack_id]
            card_ids = stack["cardIds"]

            Enum.reduce(card_ids, game, fn(card_id, acc) ->
              evaluate(acc, ["DISCARD_CARD", card_id], trace)
            end)

          "MOVE_STACKS" ->
            argc = Enum.count(code) - 1
            orig_group_id = evaluate(game, Enum.at(code, 1), trace ++ ["orig_group_id"])
            dest_group_id = evaluate(game, Enum.at(code, 2), trace ++ ["dest_group_id"])
            top_n = if argc >= 3 do evaluate(game, Enum.at(code, 3), trace ++ ["top_n"]) else length(game["groupById"][orig_group_id]["stackIds"]) end
            position = if argc >= 4 do evaluate(game, Enum.at(code, 4), trace ++ ["position"]) else "shuffle" end
            options = if argc >= 5 do evaluate(game, Enum.at(code, 4), trace ++ ["options"] ) else nil end
            GameUI.move_stacks(game, orig_group_id, dest_group_id, top_n, position, options)

          "SHUFFLE_GROUP" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["group_id"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            shuffled_stack_ids = stack_ids |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], shuffled_stack_ids)

          "SHUFFLE_TOP_X" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["group_id"])
            x = evaluate(game, Enum.at(code, 2), trace ++ ["x"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_l = Enum.slice(stack_ids, 0, x)
            stack_ids_r = Enum.slice(stack_ids, x, Enum.count(stack_ids))
            stack_ids_l = stack_ids_l |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "SHUFFLE_BOTTOM_X" ->
            group_id = evaluate(game, Enum.at(code, 1), trace ++ ["group_id"])
            x = evaluate(game, Enum.at(code, 2), trace ++ ["x"])
            stack_ids = game["groupById"][group_id]["stackIds"]
            stack_ids_r = Enum.slice(stack_ids, -x, x)
            stack_ids_l = Enum.slice(stack_ids, 0, Enum.count(stack_ids) - x)
            stack_ids_r = stack_ids_r |> Enum.shuffle
            put_in(game, ["groupById", group_id, "stackIds"], stack_ids_l ++ stack_ids_r)

          "FACEUP_NAME_FROM_STACK_ID" ->
            stack_id = evaluate(game, Enum.at(code, 1), trace ++ ["stack_id"])
            card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)
            evaluate(game, ["FACEUP_NAME_FROM_CARD_ID", card_id], trace)

          "FACEUP_NAME_FROM_CARD_ID" ->
            card_id = evaluate(game, Enum.at(code, 1), trace ++ ["card_id"])
            card = game["cardById"][card_id]
            face = card["sides"][card["currentSide"]]
            face["name"]

          "RESET_INDEX" ->
            Enum.reduce(game["groupById"], game, fn({_group_id, group}, acc) ->
              Enum.reduce(Enum.with_index(group["stackIds"]), acc, fn({stack_id, stack_index}, acc1) ->
                stack = GameUI.get_stack(acc1, stack_id)
                Enum.reduce(Enum.with_index(stack["cardIds"]), acc1, fn({card_id, card_index}, acc2) ->
                  acc2
                  |> evaluate(["SET", "/cardById/" <> card_id <> "/stackIndex", stack_index], ["update_card_state orig_group stack_index:#{stack_index}"])
                  |> evaluate(["SET", "/cardById/" <> card_id <> "/cardIndex", card_index], ["update_card_state orig_group card_index:#{card_index}"])
                end)
              end)
            end)

          "ONE_CARD" ->
            var_name = Enum.at(code, 1)
            condition = Enum.at(code, 2)
            one_card = Enum.find(Map.values(game["cardById"]), fn(card) ->
              card_match?(game, var_name, card, condition, trace)
            end)
            one_card

          "FILTER_CARDS" ->
            var_name = Enum.at(code, 1)
            condition = Enum.at(code, 2)
            all_cards = Enum.filter(Map.values(game["cardById"]), fn(card) ->
              card_match?(game, var_name, card, condition, trace)
            end)
            all_cards

          "PROCESS_MAP" ->
            evaluate(game, Enum.at(code, 1), trace ++ ["map"])
            |> Enum.reduce(%{}, fn({k, v}, acc) ->
              k = evaluate(game, k, trace ++ ["key"])
              v = evaluate(game, v, trace ++ ["value"])
              put_in(acc, [k], v)
            end)

          "PROMPT" ->
            target_player_list = evaluate(game, Enum.at(code, 1), trace ++ ["target_player_n"])
            target_player_list = if is_list(target_player_list) do
              target_player_list
            else
              [target_player_list]
            end
            prompt_id = evaluate(game, Enum.at(code, 2), trace ++ ["prompt_id"])
            arg_vals = Enum.slice(code, 3, Enum.count(code))
            game_def = Plugins.get_game_def(game["options"]["pluginId"])

            orig_prompt = game_def["prompts"][prompt_id]
            orig_args = orig_prompt["args"]
            orig_message = orig_prompt["message"]
            orig_options = orig_prompt["options"]

            # Generate the variable definition statements that we to resolve the message and to prepended to the code
            var_statements = Enum.reduce(Enum.with_index(orig_args), [], fn({arg, index}, acc) ->
              [{arg_name, arg_val}] = cond do
                index >= Enum.count(arg_vals) -> # If we are beyond the range of input arguments, look for default arguments
                  if is_map(arg) do
                    Map.to_list(arg)
                  else
                    raise "Prompt #{prompt_id} expects #{Enum.count(orig_args)} arguments, but got #{Enum.count(arg_vals)}."
                  end
                true -> # We are within the range of input arguments, so use the input argument
                  arg_val = Enum.at(arg_vals, index)
                  if is_map(arg) do
                    arg_name = Enum.at(Map.keys(arg), 0)
                    [{arg_name, arg_val}]
                  else
                    arg_name = arg
                    [{arg_name, arg_val}]
                  end
              end
              acc ++ [["VAR", arg_name, arg_val]]
            end)
            temp_game = Enum.reduce(var_statements, game, fn(var_statement, acc) ->
              evaluate(acc, var_statement, trace ++ ["var_statement"])
            end)
            new_message = evaluate(temp_game, orig_message, trace ++ ["message"])
            prompt_uuid = Ecto.UUID.generate


            new_prompt = orig_prompt
            |> Map.put("uuid", prompt_uuid)
            |> Map.put("message", new_message)
            |> Map.put("timestamp", DateTime.utc_now() |> DateTime.to_unix(:second) |> round())

            game = Enum.reduce(target_player_list, game, fn(target_player_n, acc) ->

              # Prepend the "VAR" statements to each option's code so that when it gets evaluated, it will have the variables defined
              # Append a command to delete the prompt
              new_options = Enum.reduce(orig_options, [], fn(option, acc) ->
                unset_command = ["UNSET", "/playerData/#{target_player_n}/prompts/#{prompt_uuid}"]
                new_option = if option["code"] != nil do
                  put_in(option, ["code"], var_statements ++ option["code"] ++ [unset_command])
                else
                  put_in(option, ["code"], unset_command)
                end
                acc ++ [new_option]
              end)
              new_prompt = put_in(new_prompt, ["options"], new_options)

              # Add the prompt to the player's prompts
              put_in(acc, ["playerData", target_player_n, "prompts", prompt_uuid], new_prompt)
            end)

            game

          "ACTION_LIST" ->

            action_list_or_id = Enum.at(code, 1)

            # Set the load_list_id
            action_list = cond do
              is_list(action_list_or_id) ->
                action_list_or_id
              String.starts_with?(action_list_or_id, "$") ->
                evaluate_inner(game, action_list_or_id, trace ++ ["variable"])
              true ->
                action_list_id = evaluate(game, Enum.at(code, 1), trace ++ ["action_list_id"])
                game_def = Plugins.get_game_def(game["options"]["pluginId"])
                game_def["actionLists"][action_list_id]
            end
            evaluate(game, action_list, trace)

          # NONE OF THE ABOVE #
          _ ->
            # Check if function_name is in game["functions"]
            if Map.has_key?(game["functions"], function_name) do
              # Get the function
              func = game["functions"][function_name]
              func_args = func["args"]
              func_code = func["code"]
              # get input args
              input_args = Enum.slice(code, 1, Enum.count(code))

              # Make sure the number of input args is not greater than the number of function args
              if Enum.count(input_args) > Enum.count(func_args) do
                raise "Function #{function_name} expects #{Enum.count(func_args)} arguments, but got #{Enum.count(input_args)}."
              end
              # Call DEFINE on each of the function args
              # new_scope_index = current_scope_index + 1
              # game = put_in(game, ["currentScopeIndex"], current_scope_index + 1)
              game = Enum.reduce(Enum.with_index(func_args), game, fn({func_arg, index}, acc) ->
                [{func_arg_name, input_arg}] = cond do
                  index >= Enum.count(input_args) -> # If we are beyond the range of input arguments, look for default arguments
                    if is_map(func_arg) do
                      Map.to_list(func_arg)
                    else
                      raise "Function #{function_name} expects #{Enum.count(func_args)} arguments, but got #{Enum.count(input_args)}."
                    end
                  true -> # We are within the range of input arguments, so use the input argument
                    input_arg = Enum.at(input_args, index)
                    if is_map(func_arg) do
                      func_arg_name = Enum.at(Map.keys(func_arg), 0)
                      [{func_arg_name, input_arg}]
                    else
                      func_arg_name = func_arg
                      [{func_arg_name, input_arg}]
                    end
                end
                evaluate(acc, ["VAR", func_arg_name, input_arg], trace ++ ["function arg #{func_arg_name}"])
              end)
              # Evaluate the function
              result = evaluate(game, func_code, trace)

              # # Revert to current scope
              # # If the result is a game, delete all defined variables
              # if is_map(result) and Map.has_key?(result, "variables") do
              #   # Loop over all keys in result["variables"] and delete the ones that end with "-#{new_scope_index}"
              #   game = Enum.reduce(Map.keys(result["variables"]), result, fn(key, acc) ->
              #     if String.ends_with?(key, "-#{new_scope_index}") do
              #       put_in(acc, ["variables"], Map.delete(acc["variables"], key))
              #     else
              #       acc
              #     end
              #   end)
              #   put_in(game, ["currentScopeIndex"], current_scope_index)
              # else
              #   result
              # end
            else
              raise "Function #{inspect(Enum.at(code,0))} not recognized in #{inspect(code)}"
            end
        end
      end
    else # not a list
      trace = trace ++ [code]

      # Replace {{}} in strings with evaluated code
      code = if is_binary(code) do
        Regex.replace(~r/\{\{(.+?)\}\}/, code, fn _, match ->
          replacement = evaluate(game, match, trace ++ ["{{}}"])
          if is_list(replacement) or is_map(replacement) do
            inspect(replacement)
          else
            to_string(replacement)
          end
        end)
      else
        code
      end

      # variable
      cond do
        # It's a variable that is being deeply accessed, split it up and evaluate the path by parts
        is_binary(code) and String.starts_with?(code, "$") and String.contains?(code, ".") ->
          split = String.split(code, ".")
          obj = evaluate(game, Enum.at(split, 0), trace)
          path = ["LIST"] ++ Enum.slice(split, 1, Enum.count(split))
          evaluate(game, ["OBJ_GET_BY_PATH", obj, path], trace)

        # It's a regular variable
        is_binary(code) and String.starts_with?(code, "$") ->
          var_name = code
          {var_defined, var_value} = find_var(var_name, current_scope_index, game["variables"])
          if var_defined do
            var_value
          else
            case var_name do
              "$PLAYER_N" ->
                if game["playerUi"]["playerN"] == nil do
                  raise "Variable $PLAYER_N is undefined."
                else
                  game["playerUi"]["playerN"]
                end

              "$ALIAS_N" ->
                player_n = evaluate(game, "$PLAYER_N", trace ++ ["$ALIAS_N"])
                get_in(game, ["playerInfo", player_n, "alias"])

              "$PLAYER_ORDER" ->
                # Call evaluate(game, ["NEXT_PLAYER", acc]) numPlayers times, starting with the current player, and put the results in a list
                num_players = game["numPlayers"]
                first_player = game["firstPlayer"]
                {player_order, _} = Enum.reduce(0..num_players-1, {[], first_player}, fn _, {acc, player_i} ->
                  next_player = evaluate(game, ["NEXT_PLAYER", player_i], trace ++ ["$PLAYER_ORDER"])
                  {acc ++ [player_i], next_player}
                end)
                player_order

              "$GAME" ->
                game

              "$GROUP_BY_ID" ->
                game["groupById"]

              "$STACK_BY_ID" ->
                game["stackById"]

              "$CARD_BY_ID" ->
                game["cardById"]

              "$PLAYER_DATA" ->
                game["playerData"]

              "$ACTIVE_CARD" ->
                evaluate(game, "$GAME.cardById.$ACTIVE_CARD_ID", trace)

              "$ACTIVE_CARD_ID" ->
                if game["playerUi"]["activeCardId"] == nil do
                  raise "Variable $ACTIVE_CARD_ID is undefined."
                else
                  game["playerUi"]["activeCardId"]
                end

              "$ACTIVE_FACE" ->
                evaluate(game, "$ACTIVE_CARD.currentFace", trace)

              "$ACTIVE_TOKENS" ->
                evaluate(game, "$ACTIVE_CARD.tokens", trace)

              "$ACTIVE_GROUP" ->
                evaluate(game, "$GAME.groupById.$ACTIVE_GROUP_ID", trace ++ ["$ACTIVE_GROUP"])

              "$ACTIVE_GROUP_ID" ->
                cond do
                  get_in(game, ["playerUi", "dropdownMenu", "group"]) ->
                    get_in(game, ["playerUi", "dropdownMenu", "group"])["id"]
                  get_in(game, ["playerUi", "activeCardId"]) ->
                    evaluate(game, "$ACTIVE_CARD.groupId", trace ++ ["$ACTIVE_GROUP"])
                  true ->
                    raise "Variable $ACTIVE_GROUP_ID is undefined."
                end

              _ ->
                raise "Variable #{code} is undefined. " <> inspect(trace)
            end
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
