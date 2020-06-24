import Ecto

defmodule SpadesGame.Stack do
  @moduledoc """
  Represents a stack of cards. Most of the time it contains just 1 card, but can have multiple attached cards.
  """
  @derive Jason.Encoder
  defstruct [:id, :cards]
  alias SpadesGame.{Card,Stack}

  @type t :: %Stack{id: String.t(), cards: list(Card)}

  @spec new_test() :: Stack.t()
  def new_test() do
    %Stack{id: Ecto.UUID.generate, cards: [Card.new_test1(),Card.new_test2(),Card.new_test3(),Card.new_test2()]}
  end

  def new_test1() do
    %Stack{id: Ecto.UUID.generate, cards: [Card.new_test1()]}
  end
end
