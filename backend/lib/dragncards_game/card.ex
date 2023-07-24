defmodule DragnCardsGame.Card do
  @moduledoc """
  Represents a playing card.
  """
  alias DragnCardsGame.{CardFace,Tokens}

  @type t :: Map.t()

  @spec convert_to_integer(String.t()) :: number
  def convert_to_integer(my_string) do
    result = Integer.parse("#{my_string}")
    case result do
      {number, _} -> number
      :error -> 0
    end
  end

  @spec card_from_card_details(Map.t(), Map.t(), String.t(), String.t()) :: Map.t()
  def card_from_card_details(card_details, game_def, card_db_id, group_id) do

    group = game_def["groups"][group_id]
    controller = group["controller"]
    base = %{
      "id" => Ecto.UUID.generate,
      "databaseId" => card_db_id,
      "currentSide" => group["defaultSideUp"],
      "rotation" => 0,
      "owner" => controller,
      "peeking" => %{},
      "targeting" => %{},
      "arrows" => %{},
      "tokens" => Tokens.new(),

      # loop over the sides in card_details
      # and add them to the card
      "sides" => Enum.reduce(card_details, %{}, fn({side,val}, acc) ->
        put_in(acc[side], CardFace.card_face_from_card_face_details(val, game_def))
      end)
    }
    # loop over the cardProperties in game_def
    Enum.reduce(game_def["cardProperties"], base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
  end
end
