defmodule SpadesGame.Card do
  @moduledoc """
  Represents a playing card.
  """
  @derive Jason.Encoder
  defstruct [:rank, :suit, :table_x, :table_y]
  alias SpadesGame.Card

  @type t :: %Card{rank: rank, suit: suit, table_x: number, table_y: number}
  @type suit :: :h | :d | :c | :s
  @type rank :: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

  def suits(), do: [:h, :d, :c, :s]
  def ranks(), do: Enum.to_list(2..14)

  @spec new_test() :: Card.t()
  def new_test() do
    %Card{rank: 8, suit: :h}
  end

  @spec from_map(%{}) :: Card.t()
  def from_map(%{"rank" => rank, "suit" => "c"}),
    do: %Card{rank: rank, suit: :c}

  def from_map(%{"rank" => rank, "suit" => "s"}),
    do: %Card{rank: rank, suit: :s}

  def from_map(%{"rank" => rank, "suit" => "d"}),
    do: %Card{rank: rank, suit: :d}

  def from_map(%{"rank" => rank, "suit" => "h"}),
    do: %Card{rank: rank, suit: :h}

  def from_map(m), do: m
end
