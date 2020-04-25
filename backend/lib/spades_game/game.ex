defmodule SpadesGame.Game do
  @moduledoc """
  Represents a game of spades.
  In early stages of the app, it only represents a
  some toy game used to test everything around it.
  """
  alias SpadesGame.{Card, Group, Deck, Game, GamePlayer, GameOptions, GameScore, TrickCard}

  require Logger

  # trick_full_time: How many ms a "full" trick stays on the table
  @trick_full_time 700

  @derive Jason.Encoder
  defstruct [
    :game_name,
    :groups,
    :options,
    :dealer,
    :status,
    :drag_id,
    :drag_x,
    :drag_y,
    :turn,
    :west,
    :north,
    :east,
    :south,
    :trick,
    :when_trick_full,
    :spades_broken,
    :score,
    :round_number,
    :winner,
    :hand_size,
  ]

  use Accessible

  @type t :: %Game{
          game_name: String.t(),
          groups: list(Group.t()),
          options: GameOptions.t(),
          status: :bidding | :playing,
          drag_id: String.t(),
          drag_x: number,
          drag_y: number,
          dealer: :west | :north | :east | :south,
          turn: nil | :west | :north | :east | :south,
          west: GamePlayer.t(),
          north: GamePlayer.t(),
          east: GamePlayer.t(),
          south: GamePlayer.t(),
          trick: list(TrickCard.t()),
          when_trick_full: nil | DateTime.t(),
          spades_broken: boolean,
          score: GameScore.t(),
          round_number: integer,
          winner: nil | :north_south | :east_west,
          hand_size: integer,
        }

  @doc """
  new/1:  Create a game with default options.
  """
  @spec new(String.t()) :: Game.t()
  def new(game_name) do
    {:ok, options} = GameOptions.validate(%{})
    new(game_name, options)
  end

  @doc """
  new/2:  Create a game with specified options.
  """
  @spec new(String.t(), GameOptions.t()) :: Game.t()
  def new(game_name, %GameOptions{} = options) do
    [w, n, e, s] =
      get_initial_hands(options)
      |> Enum.map(fn d -> GamePlayer.new(d) end)

    table = Group.new()

    %Game{
      game_name: game_name,
      groups: [],
      options: options,
      status: :bidding,
      drag_id: "",
      drag_x: 0,
      drag_y: 0,
      dealer: :north,
      turn: :east,
      west: w,
      north: n,
      east: e,
      south: s,
      trick: [],
      when_trick_full: nil,
      spades_broken: false,
      score: GameScore.new(),
      round_number: 1,
      winner: nil,
      hand_size: 13,
    }
  end

  # get_initial_hands/1: (options)
  # return an array of 4 hands to use when constructing the game.
  # uses hardcoded cards if specified by options
  @spec get_initial_hands(GameOptions.t()) :: list(Deck.t())
  defp get_initial_hands(%GameOptions{} = options) do
    case options.hardcoded_cards do
      true ->
        Deck.hardcoded_cards()

      _ ->
        Deck.new_shuffled() |> Enum.chunk_every(13)

        # For testing: 5 card hands
        # change hand_size above as well
        # Deck.new_shuffled() |> Enum.chunk_every(13) |> Enum.map(fn x -> Enum.take(x, 5) end)
    end
  end

  @spec bid(Game.t(), :west | :north | :east | :south, integer) ::
          {:ok, Game.t()} | {:error, String.t()}
  def bid(%Game{winner: winner}, _seat, _bid_num) when winner != nil do
    {:error, "Cannot bid in a won game"}
  end

  def bid(game, seat, bid_num) do
    {:ok, game}
    |> ensure_bidding()
    |> ensure_active_player(seat)
    |> set_bid(seat, bid_num)
    |> bid_advance()
  end

  @spec ensure_bidding({:ok, Game.t()} | {:error, String.t()}) ::
          {:ok, Game.t()} | {:error, String.t()}
  def ensure_bidding({:error, message}), do: {:error, message}
  def ensure_bidding({:ok, %Game{status: :playing}}), do: {:error, "Can't bid while playing"}
  def ensure_bidding({:ok, game}), do: {:ok, game}

  @spec set_bid(
          {:ok, Game.t()} | {:error, String.t()},
          :west | :north | :east | :south,
          nil | integer
        ) ::
          {:ok, Game.t()} | {:error, String.t()}
  def set_bid({:error, message}, _seat, _bid), do: {:error, message}

  def set_bid({:ok, game}, seat, bid) when is_nil(bid) or (bid >= 0 and bid <= 13) do
    player =
      Map.get(game, seat)
      |> GamePlayer.set_bid(bid)

    {:ok, Map.put(game, seat, player)}
  end

  # bid_advance/1: Used as the last step in a bid.
  # Advance the game turn, then move the status to playing
  # if everyone has bid.
  def bid_advance({:error, message}), do: {:error, message}

  def bid_advance({:ok, game}) do
    bids =
      [:west, :north, :east, :south]
      |> Enum.map(fn seat -> Map.get(game, seat).bid end)

    game = %Game{game | turn: rotate(game.turn)}

    if Enum.any?(bids, fn b -> b == nil end) do
      {:ok, game}
    else
      game = %Game{game | status: :playing}
      {:ok, game}
    end
  end

  # play/3: A player puts a card on the table. (Moves from hand to trick.)
  @spec play(Game.t(), :west | :north | :east | :south, Card.t()) ::
          {:ok, Game.t()} | {:error, String.t()}

  # Should I add these for pipelining?
  # def play({:ok, game}, seat, card), do: play(game, seat, card)
  # def play({:error, _message}, _seat, _card), do: raise("Can't play on an error tuple")

  def play(%Game{winner: winner}, _seat, _card) when winner != nil do
    {:error, "Cannot play in a won game"}
  end

  def play(%Game{} = game, seat, %Card{} = card) do
    {:ok, game}
    |> ensure_playing()
    |> ensure_active_player(seat)
    |> remove_card_from_hand(seat, card)
    |> add_card_to_trick(seat, card)
    |> advance_turn()
    |> check_for_trick_winner()
    |> check_for_new_round()
  end

  # drag_card/5: A player moves a card on the table.
  @spec drag_card(Game.t(), number | :bot, String.t(), number, number) :: #DragEvent.t()) ::
          {:ok, Game.t()} | {:error, String.t()}

  def drag_card(%Game{} = game, user_id, drag_id, drag_x, drag_y) do
    {:ok, %Game{game | drag_id: drag_id, drag_x: drag_x, drag_y: drag_y}}
  end

  @doc """
  checks/1:  Checks for time-based changes.
  Checks is safe to call at any time, as many times as you would like.

  The only time-based change: After a trick is filled, it doesn't clear out
  until a second or two later.
  """
  @spec checks(Game.t()) :: {:ok, Game.t()} | {:error, String.t()}
  def checks(%Game{} = game) do
    {:ok, game}
    |> check_for_trick_winner()
    |> check_for_new_round()
  end

  @spec ensure_playing({:ok, Game.t()} | {:error, String.t()}) ::
          {:ok, Game.t()} | {:error, String.t()}
  def ensure_playing({:error, message}), do: {:error, message}
  def ensure_playing({:ok, %Game{status: :bidding}}), do: {:error, "Can't play while bidding"}
  def ensure_playing({:ok, game}), do: {:ok, game}

  # Ensure_active_player/2: Only continue if the seat is the player
  # whose turn it is.
  @spec ensure_active_player(
          {:ok, Game.t()} | {:error, String.t()},
          :west | :north | :east | :south
        ) ::
          {:ok, Game.t()} | {:error, String.t()}
  def ensure_active_player({:error, message}, _seat), do: {:error, message}

  def ensure_active_player({:ok, game}, seat) do
    if game.turn == seat do
      {:ok, game}
    else
      # %{turn: game.turn, seat: seat} |> IO.inspect(label: "error_details")
      {:error, "Inactive player attempted to play a card or bid"}
    end
  end

  # Remove_card_from_hand/3: Take the card and remove it from the player's
  # hand.  Checks to see if the player actually has the card.
  @spec remove_card_from_hand(
          {:ok, Game.t()} | {:error, String.t()},
          :west | :north | :east | :south,
          Card.t()
        ) ::
          {:ok, Game.t()} | {:error, String.t()}
  def remove_card_from_hand({:error, message}, _seat, _card), do: {:error, message}

  def remove_card_from_hand({:ok, game}, seat, card) do
    player_tuple =
      Map.get(game, seat)
      |> GamePlayer.play(card)

    case player_tuple do
      {:ok, player, _card} ->
        {:ok, Map.put(game, seat, player)}

      {:error, _player} ->
        {:error, "Unable to remove card. Does that player have that card?"}
    end
  end

  @doc """
  add_card_to_trick/3: Add the card specified to the current trick.
  Or start a new trick if no trick is in progress.
  Checks to ensure it's a valid play.
  """
  @spec add_card_to_trick(
          {:ok, Game.t()} | {:error, String.t()},
          :west | :north | :east | :south,
          Card.t()
        ) ::
          {:ok, Game.t()} | {:error, String.t()}
  def add_card_to_trick({:error, message}, _seat, _card), do: {:error, message}

  def add_card_to_trick({:ok, game}, seat, card) do
    cond do
      length(game.trick) >= 4 ->
        {:error, "Too many cards in trick to add another"}

      Enum.empty?(game.trick) && !valid_lead_card?(game, seat, card) ->
        {:error, "Tried to play a spade before they were broken"}

      !Enum.empty?(game.trick) && !followed_suit?(game, seat, card) ->
        {:error, "Player could follow suit but didn't"}

      true ->
        trick_card = %TrickCard{card: card, seat: seat}
        new_trick = [trick_card | game.trick]

        # Set when_trick_full timestamp if adding the 4th card
        when_trick_full =
          if length(new_trick) >= 4 and length(game.trick) < 4 do
            DateTime.utc_now()
          else
            game.when_trick_full
          end

        {:ok, %Game{game | trick: new_trick, when_trick_full: when_trick_full}}
    end
  end

  @doc """
  followed_suit?/3 If the player in seat seat played this card, would
  they be following the rule of "You have to follow the trick's suit if
  possible?"
  """
  @spec followed_suit?(Game.t(), :north | :east | :west | :south, Card.t()) :: boolean
  def followed_suit?(game, seat, card) do
    IO.puts("followed_suit?")
    %TrickCard{card: first_card, seat: _first_player} = List.last(game.trick)
    this_player = Map.get(game, seat)

    cond do
      card.suit == first_card.suit -> true
      not GamePlayer.has_suit?(this_player, first_card.suit) -> true
      true -> false
    end
  end

  @doc """
  valid_lead_card?/3 Is this card eligible to begin a trick?
  """
  @spec valid_lead_card?(Game.t(), :north | :east | :west | :south, Card.t()) :: boolean
  def valid_lead_card?(game, seat, card) do
    IO.puts("valid_lead_card?")
    # Invalid card: !game.spades_broken && card.suit == :s
    # Use DeMorgan's Law to invert
    game.spades_broken || card.suit != :s || only_spades_left?(game, seat)
  end

  @doc """
  only_spades_left?/2 Does this player only have spades in their hand?
  """
  @spec only_spades_left?(Game.t(), :north | :east | :west | :south) :: boolean
  def only_spades_left?(game, seat) do
    hand_length = Map.get(game, seat) |> GamePlayer.hand_length()
    spades_length = Map.get(game, seat) |> GamePlayer.spades_length()
    hand_length == spades_length
  end

  @doc """
  advance_turn/1: Make the game.turn variable advance clockwise
  """
  @spec advance_turn({:ok, Game.t()} | {:error, String.t()}) ::
          {:ok, Game.t()} | {:error, String.t()}
  def advance_turn({:error, message}), do: {:error, message}

  def advance_turn({:ok, game}) do
    if length(game.trick) < 4 do
      game = %Game{game | turn: rotate(game.turn)}
      {:ok, game}
    else
      {:ok, game}
    end
  end

  @doc """
  check_for_trick_winner/1:
    No trick winner: Do nothing.
    Trick winner, but not enough time has elasped: Set turn to nil.
    Trick winner, enough time has elapsed: Set up for the next trick.
  """
  @spec check_for_trick_winner({:ok, Game.t()} | {:error, String.t()}) ::
          {:ok, Game.t()} | {:error, String.t()}
  def check_for_trick_winner({:error, message}), do: {:error, message}

  def check_for_trick_winner({:ok, game}) do
    cond do
      length(game.trick) > 4 ->
        {:error, "Trick too large"}

      length(game.trick) == 4 && game.when_trick_full == nil ->
        {:error, "Trick is full, but no timestamp is set"}

      length(game.trick) == 4 && ms_elapsed_since(game.when_trick_full) < @trick_full_time ->
        game = %Game{game | turn: nil}
        {:ok, game}

      length(game.trick) == 4 && ms_elapsed_since(game.when_trick_full) >= @trick_full_time ->
        # Compute trick winner
        %TrickCard{card: _card, seat: seat} = trick_winner(game.trick)
        # Give them +1 tricks, clear the current trick, set the turn
        new_player = Map.get(game, seat) |> GamePlayer.won_trick()

        game =
          game
          |> break_spades_if_needed()
          |> Map.put(seat, new_player)
          |> Map.put(:turn, seat)
          |> Map.put(:trick, [])
          |> Map.put(:when_trick_full, nil)

        {:ok, game}

      length(game.trick) < 4 ->
        {:ok, game}
    end
  end

  @doc """
  check_for_new_round/1:
    If players still have cards: Do nothing.
    If hands are empty:
      - Tally Score
      - Deal new hands or declare winner
  """
  @spec check_for_new_round({:ok, Game.t()} | {:error, String.t()}) ::
          {:ok, Game.t()} | {:error, String.t()}
  def check_for_new_round({:error, message}), do: {:error, message}

  def check_for_new_round({:ok, game}) do
    if tricks_played(game) >= game.hand_size do
      # Round is over, compute score
      game = compute_score(game)

      # Get new hands
      [w, n, e, s] =
        get_initial_hands(game.options)
        |> Enum.map(fn d -> GamePlayer.new(d) end)

      # Dealer position rotates, first to bid is left of new dealer
      dealer = rotate(game.dealer)
      turn = rotate(dealer)

      game =
        %Game{
          game
          | west: w,
            north: n,
            east: e,
            south: s,
            status: :bidding,
            dealer: dealer,
            turn: turn,
            round_number: game.round_number + 1,
            spades_broken: false
        }
        |> check_for_game_winner()

      {:ok, game}
    else
      {:ok, game}
    end
  end

  @spec check_for_game_winner(Game.t()) :: Game.t()
  def check_for_game_winner(%Game{score: score} = game) do
    %Game{game | winner: GameScore.winner(score)}
  end

  @spec tricks_played(Game.t()) :: integer()
  def tricks_played(%Game{} = game) do
    game.north.tricks_won + game.east.tricks_won + game.west.tricks_won + game.south.tricks_won
  end

  @doc """
  rewind_trickfull_devtest/1:
  If a "when_trick_full" timestamp is set, rewind it to be
  10 minutes ago.  Also run check_for_trick_winner.  Used in
  dev and testing for instant trick advance only.
  """
  @spec rewind_trickfull_devtest(Game.t()) :: Game.t()
  def rewind_trickfull_devtest(%Game{when_trick_full: nil} = game), do: game

  def rewind_trickfull_devtest(%Game{} = game) do
    ten_mins_in_seconds = 60 * 10
    nt = DateTime.add(game.when_trick_full, -1 * ten_mins_in_seconds, :second)
    game = %Game{game | when_trick_full: nt}
    {:ok, game} = checks(game)
    game
  end

  # ms_elapsed_since/1: How many MS have elapsed since the provided datetime?
  defp ms_elapsed_since(nil), do: 0

  defp ms_elapsed_since(%DateTime{} = dt) do
    DateTime.diff(DateTime.utc_now(), dt, :millisecond)
  end

  # break_spades_if_needed/1 Mark spades as broken if they were broken.
  @spec break_spades_if_needed(Game.t()) :: Game.t()
  defp break_spades_if_needed(game) do
    if !game.spades_broken && has_spade?(game.trick) do
      %Game{game | spades_broken: true}
    else
      game
    end
  end

  # has_spade?/1 Does this trick contain a spade?
  @spec has_spade?(list(TrickCard.t())) :: boolean
  defp has_spade?(trick) do
    trick
    |> Enum.any?(fn %TrickCard{card: card, seat: _player} -> card.suit == :s end)
  end

  # Clockwise rotation
  def rotate(:north), do: :east
  def rotate(:east), do: :south
  def rotate(:south), do: :west
  def rotate(:west), do: :north

  # partner(:north) = :south
  # partner(:west) = :east
  # etc
  @spec partner(:north | :east | :west | :south) :: :north | :east | :west | :south
  def partner(seat) do
    seat
    |> rotate()
    |> rotate()
  end

  @doc """
  trick_winner/1: Out of a trick (list of TrickCards), which card (TrickCard) won?
  """
  @spec trick_winner(list(TrickCard.t())) :: TrickCard.t()
  def trick_winner(trick) when is_list(trick) do
    # First card = last in list by convention
    %TrickCard{card: first_card, seat: _first_player} = List.last(trick)
    this_priority = suit_priority(first_card.suit)

    Enum.max_by(
      trick,
      fn %TrickCard{card: card, seat: _seat} ->
        this_priority[card.suit] + card.rank
      end
    )
  end

  @doc """
  trick_winner_index/1: Out of a trick (list of TrickCards), which card (TrickCard) won?
  Return the 0 based index instead of the TrickCard.
  """
  @spec trick_winner_index(list(TrickCard.t())) :: nil | integer
  def trick_winner_index([]), do: nil

  def trick_winner_index(trick) when is_list(trick) do
    winner = trick_winner(trick)

    trick
    |> Enum.find_index(fn x -> x == winner end)
  end

  # Define the priorities of a suit in a trick, based on the first card's suit
  def suit_priority(:s), do: %{s: 200, h: 0, c: 0, d: 0}
  def suit_priority(:h), do: %{s: 200, h: 100, c: 0, d: 0}
  def suit_priority(:c), do: %{s: 200, h: 0, c: 100, d: 0}
  def suit_priority(:d), do: %{s: 200, h: 0, c: 0, d: 100}

  @doc """
  trick_full?/1
  Does the game's current trick have one card for each player?
  """
  @spec trick_full?(Game.t()) :: boolean
  def trick_full?(%Game{} = game) do
    length(game.trick) >= 4
  end

  @doc """
  compute_score/1 Add a round of scoring to the Game.
  Call only when a round has ended.
  """
  @spec compute_score(Game.t()) :: Game.t()
  def compute_score(%Game{} = game) do
    score = GameScore.update(game.score, game)
    %{game | score: score}
  end

  @doc """
  valid_cards/2 : Which cards are valid for this player
  to play?  Only works if game is playing.
  """
  @spec valid_cards(Game.t(), :west | :north | :east | :south) ::
          {:ok, Deck.t()} | {:error, String.t()}
  def valid_cards(%Game{status: :bidding}, _seat) do
    {:error, "Can't play while bidding"}
  end

  def valid_cards(%Game{turn: current_turn, status: :playing}, seat) when current_turn != seat do
    {:error, "Not that player's turn"}
  end

  def valid_cards(%Game{turn: current_turn, status: :playing} = game, seat)
      when current_turn == seat do
    cards =
      Map.get(game, seat).hand
      |> Enum.filter(fn card ->
        case play(game, seat, card) do
          {:ok, _game} ->
            true

          {:error, _msg} ->
            false
        end
      end)

    {:ok, cards}
  end

  def valid_cards(_, _) do
    {:error, "Unspecified error"}
  end

  @doc """
  Get the hand (list of cards) for a specific seat.
  """
  @spec hand(Game.t(), :west | :north | :east | :south) :: Deck.t()
  def hand(%Game{} = game, seat) do
    Map.get(game, seat).hand
  end
end
