defmodule DragnCardsGame.GameUiTest do
  use ExUnit.Case, async: true
  use DragnCardsWeb.ConnCase
  alias DragnCards.{Plugins, Plugins.Plugin, Repo}
  alias DragnCards.Users.User
  import Ecto.Query

  alias DragnCardsGame.{GameUI, Game, Evaluate}

  import ExUnit.Callbacks

  setup do
    # Fetch the first user from the database
    user = Repo.one(from u in DragnCards.Users.User, limit: 1)
    plugin_id = 3

    plugin = Repo.one(from p in Plugin, where: p.id == ^plugin_id)
    card_db = plugin.card_db

    options = %{"pluginId" => plugin_id}

    gameui = GameUI.new("game_name", user, options)

    # Load a deck
    cards = plugin.game_def["preBuiltDecks"]["Trilogy"]["cards"]
    cards =
      Enum.map(cards, fn item ->
        %{
          "uuid" => item["uuid"],
          "quantity" => item["quantity"],
          "cardDetails" => card_db[item["uuid"]],
          "loadGroupId" => String.replace(item["loadGroupId"], "playerN", "player1")
        }
      end)
    gameui = GameUI.game_action(gameui, user.id, "load_cards", %{"load_list" => cards})

    # Return a tuple with the GameUI instance and the fetched user
    {:ok, %{gameui: gameui, user: user, plugin: plugin}}
  end

  # test "GameUI initializes with the correct name", %{gameui: gameui, user: user} do
  #   # Get the game name from the GameUI instance in the setup block
  #   assert gameui["roomName"] == "game_name"
  # end

  # test "Load cards", %{gameui: gameui, user: user, plugin: plugin} do
  #   # Get the game name from the GameUI instance in the setup block
  #   assert Enum.count(gameui["game"]["groupById"]["player1Deck"]["stackIds"]) > 0
  # end

  test "Check Aragorn", %{gameui: gameui, user: user, plugin: plugin} do

    game = gameui["game"]
    card_by_id = game["cardById"]
    card_db_id = "a6cdd8d3-cd6e-4d1a-908b-2f788fbb357e"

    {chosen_card_id, chosen_card} = Enum.find(Map.to_list(card_by_id), fn {key, card} ->
      card["cardDbId"] == card_db_id
    end)
    IO.puts("8888888888888888888888888_________")
    Evaluate.evaluate(game, ["GAME_SET_VAL", "cardById", chosen_card_id, "inPlay", true])
    IO.puts("8888888888888888888888888")
    assert chosen_card["_automate_"]
  end
end
