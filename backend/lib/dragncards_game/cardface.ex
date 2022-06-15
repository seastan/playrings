
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
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) round/i) do steps ++ ["0.0"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) resource phase/i) do steps ++ ["1.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) planning phase/i) do steps ++ ["2.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) quest phase/i) do steps ++ ["3.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) travel phase/i) do steps ++ ["4.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) encounter phase/i) do steps ++ ["5.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) combat phase/i) do steps ++ ["6.1"] else steps end
      steps = if String.match?(search_string, ~r/at the beginning of (each|the) refresh phase/i) do steps ++ ["7.1"] else steps end

      steps = if String.match?(search_string, ~r/at the end of (each|the) round/i) do steps ++ ["0.1"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) resource phase/i) do steps ++ ["1.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) planning phase/i) do steps ++ ["2.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) quest phase/i) do steps ++ ["3.5"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) travel phase/i) do steps ++ ["4.3"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) encounter phase/i) do steps ++ ["5.4"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) combat phase/i) do steps ++ ["6.11"] else steps end
      steps = if String.match?(search_string, ~r/at the end of (each|the) refresh phase/i) do steps ++ ["7.5"] else steps end

      steps = if String.match?(search_string, ~r/during (each|the) resource phase/i) do steps ++ ["1.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) planning phase/i) do steps ++ ["2.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) quest phase/i) do steps ++ ["3.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) staging step/i) do steps ++ ["3.3"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) travel phase/i) do steps ++ ["4.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) encounter phase/i) do steps ++ ["5.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) combat phase/i) do steps ++ ["6.1"] else steps end
      steps = if String.match?(search_string, ~r/during (each|the) refresh phase/i) do steps ++ ["7.1"] else steps end

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

  @spec card_face_from_card_face_details(Map.t(), Map.t()) :: Map.t()
  def card_face_from_card_face_details(card_face_details, game_def) do
    type = card_face_details["type"]
    card_face = card_face_details
    |> Map.put("width",game_def["cardTypes"][type]["width"])
    |> Map.put("height",game_def["cardTypes"][type]["height"])
  end
end
