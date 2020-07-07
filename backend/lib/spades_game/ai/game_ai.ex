defmodule SpadesGame.GameAI do
  @moduledoc """
  ...
  """
  alias SpadesGame.{Card, GameUI, Game}
  alias SpadesGame.GameAI.{Bid, Play}

  @spec bid_amount(GameUI.t()) :: integer
  def bid_amount(%GameUI{game: game} = _game_ui) do
    # "Need to bid" |> IO.inspect()

    # hand = game[game.turn].hand  # Old way
    # New way
    hand = Game.hand(game, game.turn)

    partner_bid = game[Game.partner(game.turn)].bid

    Bid.bid(hand, partner_bid)
  end

  @spec play_card(GameUI.t()) :: Card.t()
  def play_card(%GameUI{game: game} = _game_ui) do
    Play.play(game)
  end

  def waiting_bot_bid?(%GameUI{game: game} = game_ui) do
    GameUI.bot_turn?(game_ui) and game.status == :bidding
  end

  def waiting_bot_play?(%GameUI{game: game} = game_ui) do
    GameUI.bot_turn?(game_ui) and game.status == :playing
  end

  def example_hand() do
    []
  end
end
