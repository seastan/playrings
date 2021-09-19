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

  @spec card_from_cardrow(Map.t(), String.t()) :: Map.t()
  def card_from_cardrow(card_row, controller) do
    %{
      "id" => String.slice(Ecto.UUID.generate,24..-1),
      "rotation" => 0,
      "exhausted" => false,
      "committed" => false,
      "currentSide" => "A",
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
      "phaseEnteerdPlay" => nil,
      "locked" => false,

      "cardBackOverride" => card_row["cardbackoverride"],
      "cardEncounterSet" => card_row["cardencounterset"],
      "cardDbId" => card_row["cardid"],
      "cardNumber" => convert_to_integer(card_row["cardnumber"]),
      "cardQuantity" => convert_to_integer(card_row["cardquantity"]),
      "cardSetId" => card_row["cardsetid"],
      "cardPackName" => card_row["cardpackname"],

      "deckGroupId" => card_row["deckgroupid"],
      "discardGroupId" => card_row["discardgroupid"],

      "sides"=> %{
        "A"=>CardFace.cardface_from_cardrowside(card_row["sides"]["A"]),
        "B"=>CardFace.cardface_from_cardrowside(card_row["sides"]["B"]),
      }
    }
  end

end
