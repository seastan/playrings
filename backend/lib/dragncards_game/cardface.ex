
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

  @spec convert_to_boolean(String.t() | nil) :: boolean
  def convert_to_boolean(my_string) do
    if my_string == nil do
      nil
    else
      result = String.downcase(my_string)
      case result do
        "true" -> true
        "false" -> false
        "0" -> false
        "1" -> true
        _ -> nil
      end
    end
  end

  @spec convert_to_string(String.t() | nil) :: String.t()
  def convert_to_string(my_string) do
    if my_string == nil do
      ""
    else
      my_string
    end
  end

  @spec convert_to_float(String.t() | nil) :: Map.t()
  def convert_to_float(my_string) do
    if my_string == nil do
      nil
    else
      result = Float.parse("#{my_string}")
      case result do
        {number, _} -> number
        :error -> 0.0
      end
    end
  end

  @spec convert_to_map(String.t() | nil) :: Map.t()
  def convert_to_map(my_string) do
    if my_string == nil do
      %{}
    else
      result = Jason.decode!(my_string)
      case result do
        map -> map
        _ -> %{}
      end
    end
  end

  @spec convert_to_list(String.t() | nil) :: List.t()
  def convert_to_list(my_string) do
    if my_string == nil do
      []
    else
      result = Jason.decode!(my_string)
      case result do
        list -> list
        _ -> []
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
        search_string = face_details[prop]
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
    IO.puts("card_face_from_card_face_details  1 #{card_face_details["name"]}")

    type = card_face_details["type"]
    name = card_face_details["name"]
    triggers = trigger_steps_from_face_details(card_face_details, game_def["stepReminderRegex"])
    width = game_def["cardTypes"][type]["width"] || game_def["cardBacks"][name]["width"] || 1
    height = game_def["cardTypes"][type]["height"] || game_def["cardBacks"][name]["height"] || 1
    card_face = card_face_details
    |> Map.put("triggers", triggers)
    |> Map.put("width", width)
    |> Map.put("height", height)
  end
end
