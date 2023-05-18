defmodule DragnCardsGame.Tokens do
  @moduledoc """
  Tokens on a card.
  """

  @type t :: Map.t()

  @spec new() :: Map.t()
  def new() do
    %{}
  end
end
