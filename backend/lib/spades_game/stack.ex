import Ecto

defmodule SpadesGame.Stack do
  @moduledoc """
  Represents a stack of cards. Most of the time it contains just 1 card, but can have multiple attached cards.
  """
  alias SpadesGame.{Card,Stack}

  @type t :: Map.t()

  @spec new_test() :: Map.t()
  def new_test() do
    %{"id"=> Ecto.UUID.generate, "cards"=> [Card.new_test1(),Card.new_test2(),Card.new_test3(),Card.new_test2()]}
#    %Stack{id=> Ecto.UUID.generate, "cards"=> [Card.new_test2()]}
  end

  def new_test1() do
    %{"id"=> Ecto.UUID.generate, "cards"=> [Card.new_test1()]}
  end

  def new_test2() do
    %{"id"=> Ecto.UUID.generate, "cards"=> [Card.new_test2()]}
  end
end
