defmodule DragnCardsGame.Stack do
  @moduledoc """
  Represents a stack of cards. Most of the time it contains just 1 card, but can have multiple attached cards.
  """
  alias DragnCardsGame.{Card}
  require Logger

  @type t :: Map.t()

  @spec empty_stack() :: Map.t()
  def empty_stack() do
    %{
      "id" => Ecto.UUID.generate,
      "cardIds" => []
    }
  end

  @spec stack_from_card(Card.t()) :: Map.t()
  def stack_from_card(card) do
    %{
      "id" => Ecto.UUID.generate,
      "cardIds" => [card["id"]]
    }
  end

  @spec stack_from_cardrow(Card.t()) :: Map.t()
  def stack_from_cardrow(card) do
    %{
      "id" => Ecto.UUID.generate,
      "cardIds" => [card["id"]]
    }
  end

  @spec stack_from_cardrow(Map.t(), String.t()) :: Map.t()
  def stack_from_cardrow(card_row, controller) do
    %{
      "id" => String.slice(Ecto.UUID.generate,24..-1),
      "cardIds" => [Card.card_from_cardrow(card_row, controller)]
    }
  end
end
