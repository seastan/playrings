defmodule SpadesGame.Group do
  @moduledoc """
  Represents a player inside a game of spades.
  They will have a hand of cards, a bid etc.
  """
  alias SpadesGame.Group

  @derive Jason.Encoder
  defstruct [:name, :type, :controller, :cards]

  use Accessible

  @type t :: %Group{
    name: string,
    type: string,
    controller: string,
    cards: list
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

end








