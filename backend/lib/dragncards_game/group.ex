defmodule DragnCardsGame.Group do
  @moduledoc """
  Represents a player inside a game of dragncards.
  They will have a hand of cards, a bid etc.
  """
  alias DragnCardsGame.{Group,Stack}

  @type t :: Map.t()

  @doc """
  new/3: Create a new group.
  """
  @spec new(String.t()) :: Map.t()
  def new(id) do
    %{
      "id"=> id,
      "stackIds"=> []
    }
  end

  @doc """
  empty/1: Empty the group.
  """
  @spec empty(Group.t()) :: Map.t()
  def empty(group) do
    %{group | "stackIds"=> []}
  end

end
