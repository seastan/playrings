
defmodule DragnCardsGame.CardFace do
  @moduledoc """
  Represents a playing card.
  """

  @type t :: Map.t()

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

  @spec trigger_steps_from_text(String.t() | nil, String.t() | nil) :: List.t()
  def trigger_steps_from_text(keywords, text) do
    search_string = "#{keywords} #{text}"
    steps = []
    steps = if text do
      steps = if String.match?(search_string, ~r/at the beginning of the round/i) do steps ++ ["0.0"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the resource phase/i) do steps ++ ["1.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the planning phase/i) do steps ++ ["2.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the quest phase/i) do steps ++ ["3.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the travel phase/i) do steps ++ ["4.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the encounter phase/i) do steps ++ ["5.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the combat phase/i) do steps ++ ["6.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of the refresh phase/i) do steps ++ ["7.1"] else steps end

      steps = if String.match?(search_string, ~r/at the end of the round/i) do steps ++ ["0.1"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the resource phase/i) do steps ++ ["1.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the planning phase/i) do steps ++ ["2.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the quest phase/i) do steps ++ ["3.5"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the travel phase/i) do steps ++ ["4.3"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the encounter phase/i) do steps ++ ["5.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the combat phase/i) do steps ++ ["6.11"] else steps end
      steps = if String.match?(search_string, ~r/at the end of the refresh phase/i) do steps ++ ["7.5"] else steps end

      steps = if String.match?(search_string, ~r/during the resource phase/i) do steps ++ ["1.1"] else steps end
      steps = if String.match?(search_string, ~r/during the planning phase/i) do steps ++ ["2.1"] else steps end
      steps = if String.match?(search_string, ~r/during the quest phase/i) do steps ++ ["3.1"] else steps end
      steps = if String.match?(search_string, ~r/during the staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/during the travel phase/i) do steps ++ ["4.1"] else steps end
      steps = if String.match?(search_string, ~r/during the encounter phase/i) do steps ++ ["5.1"] else steps end
      steps = if String.match?(search_string, ~r/during the combat phase/i) do steps ++ ["6.1"] else steps end
      steps = if String.match?(search_string, ~r/during the refresh phase/i) do steps ++ ["7.1"] else steps end

      steps = if String.match?(search_string, ~r/time x./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 1./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 2./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 3./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 4./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 5./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 6./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 7./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 8./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 9./i) do steps ++ ["7.5"] else steps end
      steps = if String.match?(search_string, ~r/time 10./i) do steps ++ ["7.5"] else steps end

      steps
    end
    steps
  end

  @spec cardface_from_cardrowside(Map.t()) :: Map.t()
  def cardface_from_cardrowside(card_row_side) do
    type = card_row_side["type"]
    width = if(type=="Quest" || type=="Side Quest", do: 1.39, else: 1.0)
    height = if(type=="Quest" || type=="Side Quest", do: 1.0, else: 1.39)
    %{
      "width"=> width,
      "height"=> height,
      "attack" => convert_to_integer(card_row_side["attack"]) || 0,
      "cost" => convert_to_integer(card_row_side["cost"]) || 0,
      "defense" => convert_to_integer(card_row_side["defense"]) || 0,
      "engagementCost" => convert_to_integer(card_row_side["engagementcost"]) || 0,
      "hitPoints" => convert_to_integer(card_row_side["hitpoints"]) || 0,
      "keywords" => card_row_side["keywords"] || "",
      "name" => card_row_side["name"],
      "printName" => card_row_side["printname"],
      "questPoints" => convert_to_integer(card_row_side["questpoints"]) || 0,
      "shadow" => card_row_side["shadow"] || "",
      "sphere" => card_row_side["sphere"] || "",
      "text" => card_row_side["text"] || "",
      "threat" => convert_to_integer(card_row_side["threat"]),
      "traits" => card_row_side["traits"],
      "type" => card_row_side["type"] || "Hero",
      "unique" => card_row_side["unique"] || false,
      "victoryPoints" => convert_to_integer(card_row_side["victorypoints"]),
      "willpower" => convert_to_integer(card_row_side["willpower"]) || 0,
      "triggers" => trigger_steps_from_text(card_row_side["keywords"], card_row_side["text"]) || [],
      "customImgUrl" => card_row_side["customimgurl"],
    }
  end
end
