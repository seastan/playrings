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

  @spec card_from_card_details(Map.t(), Map.t(), String.t()) :: Map.t()
  def card_from_card_details(card_details, game_def, group_id) do
    group = game_def["groups"][group_id]
    controller = group["controller"]
    base = %{
      "id" => Ecto.UUID.generate,
      "cardDbId" => card_details["cardid"],
      "currentSide" => "A",
      "rotation" => 0,
      "owner" => controller,
      "controller" => controller,
      "peeking" => %{
        "player1" => false,
        "player2" => false,
        "player3" => false,
        "player4" => false,
      },
      "targeting" => %{
        "player1" => false,
        "player2" => false,
        "player3" => false,
        "player4" => false,
      },
      "tokens" => Tokens.new(),
      "tokensPerRound" => %{},
      "roundEnteredPlay" => nil,
      "phaseEnteredPlay" => nil,
      "inPlay" => false,

      "deckGroupId" => group["deckGroupId"],
      "discardGroupId" => group["discardGroupId"],

      "sides"=> %{
        "A"=>CardFace.card_face_from_card_face_details(card_details["A"], game_def),
        "B"=>CardFace.card_face_from_card_face_details(card_details["B"], game_def),
      }
    }
    card = Enum.reduce(game_def["cardProperties"], base, fn({key,val}, acc) ->
      put_in(acc[key], val["default"])
    end)
  end
end
