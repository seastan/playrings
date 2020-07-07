import Ecto

defmodule SpadesGame.Card do
  @moduledoc """
  Represents a playing card.
  """
  alias SpadesGame.Card

  @type t :: Map.t()
  @type suit :: :h | :d | :c | :s
  @type rank :: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

  def suits(), do: [:h, :d, :c, :s]
  def ranks(), do: Enum.to_list(2..14)

  @spec new_test1() :: Map.t()
  def new_test1() do
    %{"id"=> Ecto.UUID.generate, "rotation"=> 0, "aspectRatio"=> 0.7, "exhausted"=> false, "rank"=> 9, "suit"=> :h, "src"=> "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Elrond.jpg"}
  end
  @spec new_test2() :: Map.t()
  def new_test2() do
    %{"id"=> Ecto.UUID.generate, "rotation"=> 0, "aspectRatio"=> 0.7, "exhausted"=> false, "rank"=> 9, "suit"=> :h, "src"=> "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Vilya.jpg"}
  end
  @spec new_test2() :: Map.t()
  def new_test3() do
    %{"id"=> Ecto.UUID.generate, "rotation"=> 90, "aspectRatio"=> 0.7, "exhausted"=> false, "rank"=> 9, "suit"=> :h, "src"=> "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Shadow-and-Flame/Miruvor.jpg"}
  end

  @spec from_map(%{}) :: Map.t()
  def from_map(%{"rank" => rank, "suit" => "c"}),
    do: %{"rank"=> rank, "suit"=> :c}

  def from_map(%{"rank" => rank, "suit" => "s"}),
    do: %{"rank"=> rank, "suit"=> :s}

  def from_map(%{"rank" => rank, "suit" => "d"}),
    do: %{"rank"=> rank, "suit"=> :d}

  def from_map(%{"rank" => rank, "suit" => "h"}),
    do: %{"rank"=> rank, "suit"=> :h}

  def from_map(m), do: m
end
