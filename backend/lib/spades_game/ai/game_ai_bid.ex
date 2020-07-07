defmodule SpadesGame.GameAI.Bid do
  @moduledoc """
  Functions for determining a bid.
  """
  alias SpadesGame.{Card, Deck}

  @spec bid(Deck.t(), nil | integer) :: integer
  def bid(hand, partner_bid) do
    soft_bid = soft_bid(hand)
    hard_bid = hard_bid(hand)

    if should_nil?(hand, partner_bid) do
      0
    else
      soft_bid
      |> pick_bid(hard_bid, partner_bid)
      |> bag_adjust(partner_bid)
      |> clamp_bid()
    end
  end

  # Usually use soft bid, but pick hard bid if partner bid 7 or more
  @spec pick_bid(integer, integer, nil | integer) :: integer
  def pick_bid(soft_bid, hard_bid, partner_bid) do
    if partner_bid != nil and partner_bid >= 7 do
      hard_bid
    else
      soft_bid
    end
  end

  # If our combined bid score is too high, adjust our bid downwards such
  # that it adds to 11
  @spec bag_adjust(integer, nil | integer) :: integer
  def bag_adjust(bid, partner_bid) do
    if partner_bid != nil and bid + partner_bid >= 12 and bid >= 1 do
      (11 - partner_bid)
      |> max(1)
    else
      bid
    end
  end

  @spec clamp_bid(integer) :: integer
  def clamp_bid(bid) when bid < 1, do: 1
  def clamp_bid(bid) when bid > 7, do: 7
  def clamp_bid(bid), do: bid

  def should_nil?(hand, partner_bid) do
    partner_bid_ok = partner_bid == nil or partner_bid >= 4
    hard_bid_ok = hard_bid(hand) == 0
    soft_bid_ok = soft_bid(hand) <= 3
    spade_count_ok = Deck.count_suit(hand, :s) <= 3
    no_aces = Deck.count_rank(hand, 14) == 0
    no_kings = Deck.count_rank(hand, 13) == 0

    [partner_bid_ok, hard_bid_ok, soft_bid_ok, spade_count_ok, no_aces, no_kings]
    |> Enum.all?(& &1)
  end

  @doc """
  hard_bid/1: How many high spades guaranteed to take tricks does this hand have?
  Example: A K Q = 3, A Q = 1, A K 10 = 2, A K Q J 10 = 5
  Counts down from ace, looks for consecutive ranks, stops at 10.
  Hmm,  _ K Q J is worth 0 but it's two guarenteed tricks.. :(
  Also, _ _ Q J 10 is worth 1!
  Should I fix this?
  """
  @spec hard_bid(Deck.t()) :: integer
  def hard_bid(hand) do
    high_spade_ranks =
      hand

    high_spade_ranks
    |> Enum.reduce_while(%{count: 0, prev: nil}, fn rank, acc ->
      if (acc.prev == nil and rank == 14) ||
           (acc.prev != nil and rank == acc.prev - 1) do
        {:cont, %{count: acc.count + 1, prev: rank}}
      else
        {:halt, acc}
      end
    end)
    |> Map.get(:count)
  end

  @spec soft_bid(Deck.t()) :: integer
  def soft_bid(hand) do
    bid =
      hard_bid(hand) + low_spade_points(hand) + offsuit_high_card_points(hand, :d) +
        offsuit_high_card_points(hand, :c) + offsuit_high_card_points(hand, :h)

    # Adjustment because bots are overall bidding low
    (bid + 0.75)
    |> round()
  end

  @spec low_spade_points(Deck.t()) :: integer
  def low_spade_points(hand) do
    hand
  end

  @spec low_spade_points_from_count(integer) :: integer
  def low_spade_points_from_count(low_spade_count)
      when low_spade_count >= 0 and low_spade_count <= 8 do
    (Float.ceil(low_spade_count / 2.5) - 0.4)
    |> max(0)
    |> trunc()
  end

  def high_card_flags(hand, suit) do
    hand_suit = hand
    has_ace =
      hand_suit

    has_king =
      hand_suit

    has_queen =
      hand_suit

    has_jack =
      hand_suit

    [has_ace, has_king, has_queen, has_jack]
  end

  def suit_count(hand, suit) do
    hand
  end

  @spec offsuit_high_card_points(Deck.t(), :h | :d | :c) :: integer
  # credo:disable-for-next-line
  def offsuit_high_card_points(hand, suit) do
    count = suit_count(hand, suit)
    [has_ace, has_king, has_queen, has_jack] = high_card_flags(hand, suit)

    cond do
      has_ace and has_king ->
        ak_offsuit_hcp(count)

      has_ace and has_queen ->
        aq_offsuit_hcp(count)

      has_king and has_queen and has_jack ->
        kqj_offsuit_hcp(count)

      has_king and has_queen ->
        kq_offsuit_hcp(count)

      has_ace ->
        a_offsuit_hcp(count)

      has_king ->
        k_offsuit_hcp(count)

      has_queen ->
        q_offsuit_hcp(count)

      true ->
        0
    end
  end

  defp ak_offsuit_hcp(count) do
    cond do
      count == 2 -> 2
      count == 3 -> 2 * 0.85 + 1 * 0.15
      # (4: 90% to make 1)
      count == 4 -> 2 * 0.50 + 1 * 0.45
      # (5: 70% to make 1)
      count == 5 -> 2 * 0.33 + 1 * 0.46
      count >= 6 -> 2 * 0.02 + 1 * 0.25
    end
  end

  defp aq_offsuit_hcp(count) do
    cond do
      count == 2 -> 2 * 0.50 + 1 * 0.50
      # (3: 95% to make 1)
      count == 3 -> 2 * 0.50 + 1 * 0.475
      # (4: 90% to make 1)
      count == 4 -> 2 * 0.50 + 1 * 0.45
      # (5: 70% to make 1)
      count == 5 -> 2 * 0.35 + 1 * 0.35
      count >= 6 -> 1 * 0.30
    end
  end

  defp kqj_offsuit_hcp(count) do
    cond do
      # (3: 95% to make 1)
      count == 3 -> 2 * 0.70 + 1 * 0.285
      # (4: 90% to make 1)
      count == 4 -> 2 * 0.50 + 1 * 0.45
      count >= 5 -> 1 * 0.66
    end
  end

  defp kq_offsuit_hcp(count) do
    cond do
      # Duplication, depends on partner having ace and not playing it
      count == 2 -> 1.25
      count == 3 -> 2 * 0.40 + 1 * 0.40
      count == 4 -> 1 * 0.70
      count == 5 -> 1 * 0.50
      count >= 6 -> 1 * 0.25
    end
  end

  defp a_offsuit_hcp(count) do
    cond do
      count == 1 -> 1
      count == 2 -> 1
      count == 3 -> 1
      count == 4 -> 1 * 0.90
      count == 5 -> 1 * 0.70
      count == 6 -> 1 * 0.50
      count >= 7 -> 1 * 0.30
    end
  end

  defp k_offsuit_hcp(count) do
    cond do
      count == 1 -> 0.1
      count == 2 -> 1 * 0.50
      count == 3 -> 1 * 0.50
      count == 4 -> 1 * 0.40
      count >= 5 -> 0
    end
  end

  defp q_offsuit_hcp(count) do
    cond do
      count == 1 -> 0
      count == 2 -> 1 * 0.33
      count == 3 -> 1 * 0.40
      count >= 4 -> 0
    end
  end
end
