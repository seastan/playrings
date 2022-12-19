
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

  @spec trigger_steps_from_face_details(Map.t(), List.t()) :: Map.t()
  def trigger_steps_from_face_details(face_details, step_triggers) do
    if step_triggers do
      Enum.reduce(step_triggers, %{}, fn(trigger_info, acc) ->
        prop = trigger_info["faceProperty"]
        regex_string = trigger_info["regex"]
        step_id = trigger_info["stepId"]
        IO.puts("checking for triggers 1")
        IO.inspect(acc)
        IO.puts("prop #{prop}")
        IO.inspect(regex_string)
        IO.inspect(step_id)
        search_string = face_details[prop]
        IO.puts("search_string #{search_string}")
        if search_string do
          case Regex.compile(regex_string, "i") do
            {:ok, regex} ->
              if String.match?(search_string |> String.downcase(), regex) do
                IO.puts("match!")
                Map.put(acc, step_id, true)
              else
                acc
              end
            _ ->
              acc
          end
        else
          acc
        end
      end)
    else
      %{}
    end
  end

  @spec card_face_from_card_face_details(Map.t(), Map.t()) :: Map.t()
  def card_face_from_card_face_details(card_face_details, game_def) do
    IO.puts("card_face_from_card_face_details")
    IO.inspect(card_face_details)
    type = card_face_details["type"]
    triggers = trigger_steps_from_face_details(card_face_details, game_def["stepTriggers"])
    card_face = card_face_details
    |> Map.put("triggers", triggers)
    |> Map.put("width", game_def["cardTypes"][type]["width"])
    |> Map.put("height", game_def["cardTypes"][type]["height"])
  end
end
