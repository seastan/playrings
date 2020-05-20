defmodule SpadesGame.Group do
  @moduledoc """
  Represents a player inside a game of spades.
  They will have a hand of cards, a bid etc.
  """
  alias SpadesGame.{Group,Card}

  @derive Jason.Encoder
  defstruct [:name, :type, :controller, :cards]

  use Accessible

  @type t :: %Group{
    name: String.t(),
    type: :hand | :deck | :discard,
    controller: String.t(),
    cards: [Card.t()]
  }

  @doc """
  new/0: Create a new player with an empty hand.
  """
  @spec new(String.t(), :hand | :deck | :discard, String.t()) :: Group.t()
  def new(name, type, controller) do
    %Group{
      name: name,
      type: type,
      controller: controller,
      cards: [Card.new_test(),Card.new_test(),Card.new_test()]
    }
  end

  @spec empty(Group.t()) :: Group.t()
  def empty(group) do
    %Group{group | cards: []}
  end

end








