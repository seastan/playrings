defmodule SpadesGame.Group do
  @moduledoc """
  Represents a player inside a game of spades.
  They will have a hand of cards, a bid etc.
  """
  alias SpadesGame.{Group,Stack}

  @type t :: Map.t()

  @doc """
  new/4: Create a new player with an empty hand.
  """
  @spec new(String.t(), String.t(), :hand | :deck | :discard | :play, String.t()) :: Map.t()
  def new(id, name, type, controller) do
    %{
      "id"=> id,
      "name"=> name,
      "type"=> type,
      "controller"=> controller,
      #"stacks"=> [Stack.new_test()]
      "stacks"=> [Stack.new_test1(),Stack.new_test2()]#,Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1()],
    }
  end

  @doc """
  new_deck/4: Create a new player with an empty hand.
  """
  @spec new_deck(String.t(), String.t(), :hand | :deck | :discard | :play, String.t()) :: Map.t()
  def new_deck(id, name, type, controller) do
    %{
      "id"=> id,
      "name"=> name,
      "type"=> type,
      "controller"=> controller,
      "stacks"=> [Stack.new_test(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1()]
      #"stacks"=> [Stack.new_test1()]
    }
  end

  @spec empty(Group.t()) :: Map.t()
  def empty(group) do
    %{group | "stacks"=> []}
  end

end
