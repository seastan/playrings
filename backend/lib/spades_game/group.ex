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
    name: string,
    type: string,
    controller: string,
    cards: [Card.t()]
  }

  @doc """
  new/0: Create a new player with an empty hand.
  """
  @spec new() :: Group.t()
  def new() do
    %Group{
      name: "blankname",
      type: "blanktype",
      controller: "blankcontroller",
      cards: []
    }
  end

  @spec new_table() :: Group.t()
  def new_table() do
    %Group{
      name: "table",
      type: "table",
      controller: "all",
      cards: [Card.new_test(),Card.new_test(),Card.new_test()]#[{:id1, "id1"},{:id2, "id2"}] #[{:id1, Card.new_test()},{:id2, Card.new_test()}]
    }
  end

end








