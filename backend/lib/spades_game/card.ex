import Ecto

defmodule SpadesGame.Card do
  @moduledoc """
  Represents a playing card.
  """
  @derive Jason.Encoder
  defstruct [:id, :rank, :suit, :src, :rotation, :aspectRatio, :exhausted]
  alias SpadesGame.Card

  @type t :: %Card{id: String.t(), rank: rank, suit: suit, src: String.t(), rotation: number, aspectRatio: number, exhausted: boolean}
  @type suit :: :h | :d | :c | :s
  @type rank :: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

  def suits(), do: [:h, :d, :c, :s]
  def ranks(), do: Enum.to_list(2..14)

  @spec new_test1() :: Card.t()
  def new_test1() do
    %Card{id: Ecto.UUID.generate, rotation: 0, aspectRatio: 0.7, exhausted: false, rank: 9, suit: :h, src: "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Elrond.jpg"}
  end
  @spec new_test2() :: Card.t()
  def new_test2() do
    %Card{id: Ecto.UUID.generate, rotation: 0, aspectRatio: 0.7, exhausted: false, rank: 9, suit: :h, src: "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Vilya.jpg"}
  end
  @spec new_test2() :: Card.t()
  def new_test3() do
    %Card{id: Ecto.UUID.generate, rotation: 90, aspectRatio: 0.7, exhausted: false, rank: 9, suit: :h, src: "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Miruvor.jpg"}
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
