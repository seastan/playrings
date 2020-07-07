defmodule SpadesGame.GameAI.Play do
  @moduledoc """
  Functions for the AI figuring out which card to play.
  """
  alias SpadesGame.{Card, Deck, Game, TrickCard}
  alias SpadesGame.GameAI.PlayInfo

  @spec play(Game.t()) :: Card.t()
  def play(%Game{turn: turn, trick: trick} = game) when turn != nil do
    {:ok, valid_cards} = Game.valid_cards(game, turn)

    info = %PlayInfo{
      hand: Game.hand(game, turn),
      valid_cards: valid_cards,
      trick: trick,
      me_nil: player_nil?(game, turn),
      partner_nil: player_nil?(game, Game.partner(turn)),
      left_nil: player_nil?(game, Game.rotate(turn)),
      right_nil: player_nil?(game, turn |> Game.partner() |> Game.rotate()),
      partner_winning: partner_winning?(game)
    }

    # true -> raise "play: don't understand this trick"
    case length(trick) do
      0 -> play_pos1(info)
      1 -> play_pos2(info)
      2 -> play_pos3(info)
      3 -> play_pos4(info)
    end
  end

  def partner_winning?(%Game{trick: trick}) do
    winner_index = Game.trick_winner_index(trick)

    is_pos3 = length(trick) == 2
    is_pos4 = length(trick) == 3
    is_pos1_winning = winner_index == 0
    is_pos2_winning = winner_index == 1

    (is_pos3 and is_pos1_winning) or (is_pos4 and is_pos2_winning)
  end

  @spec player_nil?(Game.t(), :west | :north | :east | :south) :: boolean
  def player_nil?(game, turn) do
    game[turn].bid == 0
  end

  # play_pos1: What card should we play if we are starting a trick?
  @spec play_pos1(PlayInfo.t()) :: Card.t()
  def play_pos1(%PlayInfo{
        valid_cards: valid_cards,
        me_nil: me_nil,
        partner_nil: partner_nil,
        left_nil: left_nil,
        right_nil: right_nil
      }) do
    {best_card, worst_card} = empty_trick_best_worst(valid_cards)

    cond do
      me_nil or left_nil or right_nil ->
        worst_card

      partner_nil ->
        best_card

      best_card.rank == 14 ->
        # Cash an ace
        best_card

      true ->
        worst_card
    end
  end

  # Given a list of cards, if we are starting a new trick, what are the best
  # and worst cards? Example: Worst card = 2 of clubs, Best card = Ace of spades.
  @spec empty_trick_best_worst(Deck.t()) :: {Card.t(), Card.t()}
  def empty_trick_best_worst(valid_cards) when length(valid_cards) > 0 do
    priority_map = priority_map([])

    sorted_cards =
      valid_cards

    worst_card = List.first(sorted_cards)
    best_card = List.last(sorted_cards)
    {best_card, worst_card}
  end

  # play_pos2: What card should we play if we are the second person playing in a trick?
  @spec play_pos2(PlayInfo.t()) :: Card.t()
  def play_pos2(%PlayInfo{me_nil: me_nil, partner_nil: partner_nil} = info) do
    options = card_options(info.trick, info.valid_cards)

    to_play =
      cond do
        me_nil ->
          [
            options.best_loser,
            options.worst_winner
          ]

        partner_nil ->
          [
            options.best_winner,
            options.worst_loser
          ]

        true ->
          [
            options.worst_winner,
            options.worst_loser
          ]
      end

    first_non_nil(to_play ++ [Enum.random(info.valid_cards)])
  end

  # play_pos3: What card should we play if we are the third person playing in a trick?
  @spec play_pos3(PlayInfo.t()) :: Card.t()
  def play_pos3(
        %PlayInfo{me_nil: me_nil, partner_nil: partner_nil, partner_winning: partner_winning} =
          info
      ) do
    options = card_options(info.trick, info.valid_cards)

    # Wants to know: Is my partner winning?
    to_play =
      cond do
        me_nil ->
          [
            options.best_loser,
            options.worst_winner
          ]

        partner_nil ->
          [
            options.worst_winner,
            options.worst_loser
          ]

        partner_winning ->
          [
            options.worst_loser,
            options.worst_winner
          ]

        true ->
          [
            options.worst_winner,
            options.worst_loser
          ]
      end

    first_non_nil(to_play ++ [Enum.random(info.valid_cards)])
  end

  # play_pos4: What card should we play if we are the fourth person playing in a trick?
  @spec play_pos4(PlayInfo.t()) :: Card.t()
  def play_pos4(
        %PlayInfo{me_nil: me_nil, partner_winning: partner_winning, partner_nil: partner_nil} =
          info
      ) do
    options = card_options(info.trick, info.valid_cards)

    to_play =
      cond do
        me_nil ->
          [
            options.best_loser,
            options.worst_winner
          ]

        partner_winning and not partner_nil ->
          # Pos 4: If my partner is winning, I don't have to win it unless they're going nil
          [
            options.worst_loser,
            options.worst_winner
          ]

        true ->
          [
            options.worst_winner,
            options.worst_loser
          ]
      end

    first_non_nil(to_play ++ [Enum.random(info.valid_cards)])
  end

  @spec first_non_nil(list(any)) :: any
  def first_non_nil(list) when length(list) > 0 do
    list
    |> Enum.filter(fn x -> x != nil end)
    |> List.first()
  end

  @spec card_options(list(TrickCard.t()), Deck.t()) :: map
  def card_options([], _valid_cards) do
    %{
      worst_winner: nil,
      best_winner: nil,
      worst_loser: nil,
      best_loser: nil
    }
  end

  def card_options(trick, valid_cards) when length(trick) > 0 do
    priority_map = priority_map(trick)
    trick_max = trick_max(trick)

    sort_cards =
      valid_cards
      |> Enum.map(fn %Card{rank: rank, suit: suit} = card ->
        val = rank + priority_map[suit]
        {card, val}
      end)
      |> Enum.sort_by(fn {_card, val} -> val end)

    winners =
      sort_cards
      |> Enum.filter(fn {_card, val} -> val >= trick_max end)
      |> Enum.map(fn {card, _val} -> card end)

    losers =
      sort_cards
      |> Enum.filter(fn {_card, val} -> val < trick_max end)
      |> Enum.map(fn {card, _val} -> card end)

    %{
      worst_winner: List.first(winners),
      best_winner: List.last(winners),
      worst_loser: List.first(losers),
      best_loser: List.last(losers)
    }
  end

  # trick_max/1
  # Given a trick with at least one card, what's the current value of the winner?
  # value = rank + suit priority
  @spec trick_max(list(TrickCard.t())) :: non_neg_integer
  def trick_max(trick) when length(trick) > 0 do
    priority_map = priority_map(trick)

    trick
    |> Enum.map(fn %TrickCard{card: %Card{rank: rank, suit: suit}} ->
      rank + priority_map[suit]
    end)
    |> Enum.max()
  end

  def trick_max([]), do: 0

  # priority_map/1
  # Given a trick, what is the priority of each suit?
  # This is the mechanism we use to track following suit,
  # ruffing and trumping.  See game.ex.
  @spec priority_map(list(TrickCard.t())) :: map
  def priority_map(trick) when length(trick) > 0 do
    List.last(trick).card.suit
    |> Game.suit_priority()
  end

  def priority_map([]) do
    %{s: 200, h: 100, c: 100, d: 100}
  end
end

## Misc notes - Can be deleted later

# Game
# turn: nil | :west | :north | :east | :south,
# west: GamePlayer.t(),
# north: GamePlayer.t(),
# east: GamePlayer.t(),
# south: GamePlayer.t(),
# %GamePlayer{
#   hand: Deck.new_empty(),
#   tricks_won: 0,
#   bid: nil
# }

#   valid_cards: [
#     %SpadesGame.Card{rank: 12, suit: :s},
#     %SpadesGame.Card{rank: 2, suit: :s}
#   ]

# In a trick, First card = last in list by convention
# game.trick: list(TrickCard.t()),
# @type t :: %TrickCard{card: Card.t(), seat: :north | :east | :west | :south}

# Info Example
# %{
#   hand: [
#     %SpadesGame.Card{rank: 12, suit: :s},
#     %SpadesGame.Card{rank: 7, suit: :c},
#     %SpadesGame.Card{rank: 2, suit: :s}
#   ],
#   trick: [
#     %SpadesGame.TrickCard{
#       card: %SpadesGame.Card{rank: 5, suit: :s},
#       seat: :east
#     },
#     %SpadesGame.TrickCard{
#       card: %SpadesGame.Card{rank: 3, suit: :s},
#       seat: :north
#     }
#   ],
#   valid_cards: [
#     %SpadesGame.Card{rank: 12, suit: :s},
#     %SpadesGame.Card{rank: 2, suit: :s}
#   ]
# }

# Trick example 1
# [
#     %SpadesGame.TrickCard{card: %SpadesGame.Card{rank: 9, suit: :d}, seat: :north},
#     %SpadesGame.TrickCard{card: %SpadesGame.Card{rank: 2, suit: :d}, seat: :west}
# ]

# Trick example 2
# Ace was played first
# [
#     %SpadesGame.TrickCard{card: %SpadesGame.Card{rank: 2, suit: :c}, seat: :east},
#     %SpadesGame.TrickCard{
#           card: %SpadesGame.Card{rank: 14, suit: :c},
#           seat: :north
#         }
# ]
