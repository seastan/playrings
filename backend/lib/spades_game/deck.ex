defmodule SpadesGame.Deck do
  @moduledoc """
  Represents a list of playing cards.
  """
  alias SpadesGame.{Deck, Card}

  @type t :: [Card.t()]

  @spec new_shuffled() :: Deck.t()
  @doc """
  new_shuffled/0: Returns a new deck with 52 cards, shuffled.
  """
  def new_shuffled do
    for rank <- Card.ranks(), suit <- Card.suits() do
      %{"rank"=> rank, "suit"=> suit}
    end
    |> Enum.shuffle()
  end

  @doc """
  new_empty/0: Makes an empty deck.
  Could be used for an empty pile, like an empty discard pile.
  """
  @spec new_empty() :: Deck.t()
  def new_empty do
    []
  end

  @doc """
  shuffle/1: Returns the input deck with its cards shuffled.
  """
  @spec shuffle(Deck.t()) :: Deck.t()
  def shuffle(deck) do
    Enum.shuffle(deck)
  end

  @doc """
  sort/1: basic sort for console display
  """
  @spec sort(Deck.t()) :: Deck.t()
  def sort(deck) do
    deck
  end

  @doc """
  count_rank/1: How many cards with this rank are in the hand?
  """
  @spec count_rank(Deck.t(), integer) :: integer
  def count_rank(hand, rank) do
    hand
  end

  @doc """
  count_suit/1: How many cards with this suit are in the hand?
  """
  @spec count_suit(Deck.t(), :d | :c | :s | :h) :: integer
  def count_suit(hand, suit) do
    hand
  end

  @spec hardcoded_cards() :: list(Deck.t())
  def hardcoded_cards do
    []
  end
end
