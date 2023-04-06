defmodule DragnCardsGame.GameUiTest do
  use ExUnit.Case, async: true
  use DragnCardsWeb.ConnCase
  alias DragnCards.{Plugins, Plugins.Plugin, Repo}
  alias DragnCards.Users.User
  import Ecto.Query
  alias Jason

  alias DragnCardsGame.{GameUI, Game, Evaluate}

  import ExUnit.Callbacks

  setup do
    user = Repo.one(from u in DragnCards.Users.User, limit: 1)
    plugin_id = 3

    plugin = Repo.one(from p in Plugin, where: p.id == ^plugin_id)
    card_db = plugin.card_db

    options = %{"pluginId" => plugin_id}

    gameui = GameUI.new("game_name", user, options)

    {:ok, file_content} = File.read("../frontend/src/features/plugins/lotrlcg/definitions/gameDefWotR.json")

    game_def = case Jason.decode(file_content) do
      {:ok, json_map} ->
        IO.inspect(json_map)
      {:error, reason} ->
        IO.puts("Error decoding JSON: #{reason}")
    end

    gameui = put_in(gameui["game"]["gameDef"], game_def)

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
    aragorn_card_db_id = "a6cdd8d3-cd6e-4d1a-908b-2f788fbb357e"
    strider_card_db_id = "f88cd1e7-0e1e-40d9-91bc-990ba64c5bc3"

    aragorn_card = Evaluate.evaluate(game, ["FIRST_CARD", ["EQUAL", "$CARD.cardDbId", aragorn_card_db_id]])
    strider_card = Evaluate.evaluate(game, ["FIRST_CARD", ["EQUAL", "$CARD.cardDbId", strider_card_db_id]])

    assert strider_card["groupId"] != "player3Eliminated"

    game = Evaluate.evaluate(game, ["MOVE_CARD", aragorn_card["id"], "player3Reserve", 0, 0])

    strider_card = Evaluate.evaluate(game, ["FIRST_CARD", ["EQUAL", "$CARD.cardDbId", strider_card_db_id]])

    assert strider_card["groupId"] == "player3Eliminated"
  end


end
