defmodule SpadesGame.Group do
  @moduledoc """
  Represents a player inside a game of spades.
  They will have a hand of cards, a bid etc.
  """
  alias SpadesGame.{Group,Stack}

  @derive Jason.Encoder
  defstruct [:id, :name, :type, :controller, :stacks]

  use Accessible

  @type t :: %Group{
    id: String.t(),
    name: String.t(),
    type: :hand | :deck | :discard | :play,
    controller: String.t(),
    stacks: [Stack.t()]
  }

  @doc """
  new/4: Create a new player with an empty hand.
  """
  @spec new(String.t(), String.t(), :hand | :deck | :discard | :play, String.t()) :: Group.t()
  def new(id, name, type, controller) do
    %Group{
      id: id,
      name: name,
      type: type,
      controller: controller,
      #stacks: [Stack.new_test()]
      stacks: [Stack.new_test1()]#,Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1()],
    }
  end

  @doc """
  new_deck/4: Create a new player with an empty hand.
  """
  @spec new_deck(String.t(), String.t(), :hand | :deck | :discard | :play, String.t()) :: Group.t()
  def new_deck(id, name, type, controller) do
    %Group{
      id: id,
      name: name,
      type: type,
      controller: controller,
      stacks: [Stack.new_test(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1(),Stack.new_test1()]
      #stacks: [Stack.new_test1()]
    }
  end

  @spec empty(Group.t()) :: Group.t()
  def empty(group) do
    %Group{group | stacks: []}
  end

end








