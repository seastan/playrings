defmodule DragnCardsGame.Evaluate.Functions.PROMPT do
  alias DragnCardsGame.Evaluate
  alias DragnCards.Plugins
  @moduledoc """
  Handles the 'PROMPT' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'PROMPT' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'PROMPT' operation.

  ## Returns

  The result of the 'PROMPT' operation.
  """
  def execute(game, code, trace) do
    target_player_list = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["target_player_n"])
    target_player_list = if is_list(target_player_list) do
      target_player_list
    else
      [target_player_list]
    end
    prompt_id = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["prompt_id"])
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
      Evaluate.evaluate(acc, var_statement, trace ++ ["var_statement"])
    end)
    new_message = Evaluate.evaluate(temp_game, orig_message, trace ++ ["message"])
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
  end


end
