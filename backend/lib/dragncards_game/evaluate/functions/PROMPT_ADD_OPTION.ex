defmodule DragnCardsGame.Evaluate.Functions.PROMPT_ADD_OPTION do
  alias DragnCardsGame.Evaluate
  alias DragnCards.Plugins
  @moduledoc """
  Handles the 'PROMPT_ADD_OPTION' operation in the DragnCardsGame evaluation process.
  """

  @doc """
  Executes the 'PROMPT_ADD_OPTION' operation with the given arguments.

  ## Parameters

    - `args`: The arguments required for the 'PROMPT_ADD_OPTION' operation.

  ## Returns

  The result of the 'PROMPT_ADD_OPTION' operation.
  """
  def execute(game, code, trace) do
    target_player_list = Evaluate.evaluate(game, Enum.at(code, 1), trace ++ ["target_player_n"])
    target_player_list = if is_list(target_player_list) do
      target_player_list
    else
      [target_player_list]
    end
    label = Evaluate.evaluate(game, Enum.at(code, 2), trace ++ ["label"])
    hotkey = Evaluate.evaluate(game, Enum.at(code, 3), trace ++ ["hotkey"])
    prompt_code = Evaluate.evaluate(game, Enum.at(code, 4), trace ++ ["prompt_code"])
    if not is_list(prompt_code) do
      raise "Code given to prompt option is not a list. Remember to use the \"LIST\" function to create a list. For example, [\"LIST\", \"SET\", \"/playerData/player1/health\", 10] will result in the action list [\"SET\", \"/playerData/player1/health\", 10] being assigned to the prompt option."
    end
    prompt_code = if is_list(Enum.at(prompt_code, 0)) do
      prompt_code
    else
      [prompt_code]
    end


    game = Enum.reduce(target_player_list, game, fn(target_player_n, acc) ->
      prompt_uuid = acc["playerData"][target_player_n]["mostRecentPromptId"]
      options = acc["playerData"][target_player_n]["prompts"][prompt_uuid]["options"]
      unset_command = ["UNSET", "/playerData/#{target_player_n}/prompts/#{prompt_uuid}"]
      prompt_code = prompt_code ++ [unset_command]
      new_option = %{
        "label" => label,
        "hotkey" => hotkey,
        "code" => prompt_code
      }
      new_options = options ++ [new_option]
      put_in(acc, ["playerData", target_player_n, "prompts", prompt_uuid, "options"], new_options)
    end)

    game
  end


end
