defmodule MyTest do
  alias DragnCardsGame.{GameUI}

  def assert(test_num, evaluated, result) do
    if evaluated != result do
      raise "Failed test #{test_num}. Expected #{result} got #{evaluated}"
    else
      IO.puts("passed test #{test_num}")
    end
  end

  def evaluate(game, code) do
    if is_list(code) && Enum.count(code) > 0 do
      if is_list(Enum.at(code, 0)) do
        #actions = Enum.slice(code, 1, Enum.count(code))
        Enum.reduce(code, game, fn(action, acc) ->
          evaluate(acc, action)
        end)
      else
        # code = Enum.reduce(code, [], fn(code_line, acc) ->
        #   IO.puts("evaluating")
        #   IO.inspect(code_line)
        #   acc ++ [evaluate(game, code_line)]
        # end)

        case Enum.at(code,0) do
          "DEFINE" ->
            var_name = Enum.at(code, 1)
            value = evaluate(game, Enum.at(code, 2))
            put_in(game, ["variables", var_name], value)
          "LIST" ->
            list = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce(list, [], fn(item,acc)->
              acc ++ [evaluate(game, item)]
            end)
          "NEXT_PLAYER" ->
            current_player_i = evaluate(game, Enum.at(code, 1))
            current_i = String.to_integer(String.slice(current_player_i, -1..-1))
            next_i = current_i + 1
            next_i = if next_i > game["numPlayers"] do 1 else next_i end
            "player" <> Integer.to_string(next_i)
          "AT_INDEX" ->
            #raise "stop"
            list = evaluate(game, Enum.at(code, 1))
            index = evaluate(game, Enum.at(code, 2))
            if list do Enum.at(list, index) else nil end
          "LENGTH" ->
            IO.inspect("Length is........................")
            IO.inspect(Enum.at(code,1))
            Enum.count(evaluate(game, Enum.at(code,1)))
          "AND" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(statements, false, fn(statement, acc) ->
              if evaluate(game, statement) == true do
                {:cont, true}
              else
                {:halt, false}
              end
            end)
          "EQUAL" ->
            evaluate(game, Enum.at(code,1)) == evaluate(game, Enum.at(code,2))
          "NOT" ->
            !evaluate(game, Enum.at(code,1))
          "JOIN_STRING" ->
            evaluate(game, Enum.at(code,1)) <> evaluate(game, Enum.at(code,2))
          "ADD" ->
            evaluate(game, Enum.at(code,1)) + evaluate(game, Enum.at(code,2))
          "SUBTRACT" ->
            evaluate(game, Enum.at(code,1)) - evaluate(game, Enum.at(code,2))
          "MULTIPLY" ->
            evaluate(game, Enum.at(code,1)) * evaluate(game, Enum.at(code,2))
          "DIVIDE" ->
            evaluate(game, Enum.at(code,1)) / evaluate(game, Enum.at(code,2))
          "OBJ_GET_BY_KEY" ->
            map = evaluate(game, Enum.at(code,1))
            key = evaluate(game, Enum.at(code,2))
            map[key]
          "OBJ_GET_BY_PATH" ->
            map = evaluate(game, Enum.at(code,1))
            path = evaluate(game, Enum.at(code,2))
            get_in(map, path)
          "GAME_GET_VAL" ->
            path = evaluate(game, Enum.at(code,1))
            get_in(game, path)
          "GET_STACK_ID" ->
            group_id = evaluate(game, Enum.at(code,1))
            stack_index = evaluate(game, Enum.at(code,2))
            evaluate(game, ["AT_INDEX", ["GAME_GET_VAL", ["groupById", group_id, "stackIds"]], stack_index])
          "GET_CARD_ID" ->
            group_id = evaluate(game, Enum.at(code,1))
            stack_index = evaluate(game, Enum.at(code,2))
            stack_id = evaluate(game, ["GET_STACK_ID", group_id, stack_index])
            card_index = evaluate(game, Enum.at(code,3))
            evaluate(game, ["AT_INDEX", ["GAME_GET_VAL", ["stackById", stack_id, "cardIds"]], card_index])
          "OBJ_SET_VAL" ->
            case Enum.count(code) do
              4 ->
                obj = evaluate(game, Enum.at(code,1))
                key = evaluate(game, Enum.at(code,2))
                value = evaluate(game, Enum.at(code,3))
                put_in(obj[key], value)
              5 ->
                obj = evaluate(game, Enum.at(code,1))
                path = evaluate(game, Enum.at(code,2))
                key = evaluate(game, Enum.at(code,3))
                value = evaluate(game, Enum.at(code,4))
                put_in(obj, path ++ [key], value)
            end
          "GAME_SET_VAL" ->
            case Enum.count(code) do
              3 ->
                path = evaluate(game, Enum.at(code,1))
                value = evaluate(game, Enum.at(code,2))
                put_in(game, path, value)
              4 ->
                path = evaluate(game, Enum.at(code,1))
                key = evaluate(game, Enum.at(code,2))
                value = evaluate(game, Enum.at(code,3))
                put_in(game, path ++ [key], value)
            end
          "GAME_INCREASE_VAL" ->
            case Enum.count(code) do
              3 ->
                path = evaluate(game, Enum.at(code,1))
                delta = evaluate(game, Enum.at(code,2))
                old_value = get_in(game, path)
                put_in(game, path, old_value + delta)
              4 ->
                path = evaluate(game, Enum.at(code,1))
                key = evaluate(game, Enum.at(code,2))
                delta = evaluate(game, Enum.at(code,3))
                old_value = get_in(game, path ++ [key])
                put_in(game, path ++ [key], old_value + delta)
            end
          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(0..Enum.count(ifthens)-1//2, nil, fn(i, acc) ->
              if evaluate(game, Enum.at(ifthens, i)) == true do
                {:halt, evaluate(game, Enum.at(ifthens, i+1))}
              else
                {:cont, nil}
              end
            end)
            #IO.puts("COND then")
            #IO.inspect("then")
            #evaluate(game, then)
          "GAME_ADD_MESSAGE" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = Enum.reduce(statements, "", fn(statement, acc) ->
              str_statement = inspect(evaluate(game, statement))
              acc <> String.replace(str_statement,"\"","")
            end)
            put_in(game["messages"], game["messages"] ++ [message])
          "FOR_EACH_START_STOP_STEP" ->
            var_name = Enum.at(code, 1)
            start = evaluate(game, Enum.at(code, 2))
            stop = evaluate(game, Enum.at(code, 3))
            step = evaluate(game, Enum.at(code, 4))
            function = Enum.at(code, 5)
            Enum.reduce(start..stop-1//step, game, fn(i, acc) ->
              acc = put_in(acc, ["variables", var_name], i)
              acc = evaluate(acc, function)
            end)
          "FOR_EACH_KEY_VAL_AT_PATH" ->
            argc = Enum.count(code) - 1
            key_name = Enum.at(code, 1)
            val_name = evaluate(game, Enum.at(code, 2))
            obj_path = evaluate(game, Enum.at(code, 3))
            old_list = evaluate(game, ["GAME_GET_VAL", obj_path])
            function = Enum.at(code, 4)
            old_list = if argc >= 5 do
              order = if argc >= 6 and evaluate(game, Enum.at(code, 6)) == "DESC" do :desc else :asc end
              Enum.sort_by(old_list, fn({key, obj}) -> get_in(obj, evaluate(game,Enum.at(code, 5))) end, order)
            else
              old_list
            end
            Enum.reduce(old_list, game, fn({key, val}, acc) ->
              acc = put_in(acc, ["variables", key_name], key)
              acc = put_in(acc, ["variables", val_name], val)
              evaluate(acc, function)
            end)
          "MOVE_CARD" ->
            argc = Enum.count(code) - 1
            card_id = evaluate(game, Enum.at(code, 1))
            if card_id do
              dest_group_id = evaluate(game, Enum.at(code, 2))
              dest_stack_index = evaluate(game, Enum.at(code, 3))
              dest_card_index = evaluate(game, Enum.at(code, 4))
              combine = if argc == 5 do evaluate(game, Enum.at(code, 5)) else nil end
              preserve_state = if argc == 6 do evaluate(game, Enum.at(code, 6)) else nil end
              GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine, preserve_state)
            else
              game
            end
          "MOVE_STACK" ->
            argc = Enum.count(code) - 1
            stack_id = evaluate(game, Enum.at(code, 1))
            dest_group_id = evaluate(game, Enum.at(code, 2))
            dest_stack_index = evaluate(game, Enum.at(code, 3))
            combine = if argc == 4 do evaluate(game, Enum.at(code, 4)) else nil end
            preserve_state = if argc == 5 do evaluate(game, Enum.at(code, 5)) else nil end
            GameUI.move_stack(game, stack_id, dest_group_id, dest_stack_index, combine, preserve_state)
          "MOVE_STACKS" ->
            argc = Enum.count(code) - 1
            orig_group_id = evaluate(game, Enum.at(code, 1))
            dest_group_id = evaluate(game, Enum.at(code, 2))
            top_n = evaluate(game, Enum.at(code, 3))
            position = evaluate(game, Enum.at(code, 4))
            GameUI.move_stacks(game, orig_group_id, dest_group_id, top_n, position)
          "FACEUP_NAME_FROM_STACK_ID" ->
            stack_id = evaluate(game, Enum.at(code, 1))
            card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)
            evaluate(game, ["FACEUP_NAME_FROM_CARD_ID", card_id])
          "FACEUP_NAME_FROM_CARD_ID" ->
            card_id = evaluate(game, Enum.at(code, 1))
            card = game["cardById"][card_id]
            face = card["sides"][card["currentSide"]]
            face["name"]
          "ACTION_LIST" ->
            action_list_id = evaluate(game, Enum.at(code, 1))
            IO.inspect("actionlist")
            IO.inspect(action_list_id)
            IO.inspect(game["actionLists"][action_list_id])
            evaluate(game, game["actionLists"][action_list_id])
          _ ->
            code
        end
      end
    else # value
      #IO.puts("parsing value #{code}")
      cond do
        code == "$PLAYER_N" ->
          game["playerUi"]["playerN"]
        code == "$GAME" ->
          game
        code == "$GAME_PATH" ->
          []
        code == "$CARD_BY_ID" ->
          game["cardById"]
        code == "$CARD_BY_ID_PATH" ->
          ["cardById"]
        code == "$ACTIVE_CARD_PATH" ->
          ["cardById", game["playerUi"]["activeCardId"]]
        code == "$ACTIVE_FACE_PATH" ->
          active_card = evaluate(game, "$ACTIVE_CARD")
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["sides", active_card["currentSide"]]
        code == "$ACTIVE_TOKENS_PATH" ->
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["tokens"]
        code == "$ACTIVE_CARD" ->
          get_in(game, evaluate(game, "$ACTIVE_CARD_PATH"))
        code == "$ACTIVE_FACE" ->
          get_in(game, evaluate(game, "$ACTIVE_FACE_PATH"))
        code == "$ACTIVE_TOKENS" ->
          get_in(game, evaluate(game, "$ACTIVE_TOKENS_PATH"))
        Map.has_key?(game, "variables") && Map.has_key?(game["variables"], code) ->
          game["variables"][code]
        true ->
          code
      end
    end
  end
end

game = %{
  "variables" => %{},
  "cardById" => %{
    "abc" => %{
      "currentSide" => "A",
      "rotation" => 0,
      "tokens" => %{
        "damage" => 1
      },
      "sides" => %{
        "A" => %{
          "name" => "testname"
        }

      }
    },
    "def" => %{
      "exhausted" => true,
      "tokens" => %{
        "damage" => 1
      }
    },
    "ghi" => %{
      "exhausted" => false,
      "tokens" => %{
        "damage" => 1
      }
    }
  },
  "playerUi" => %{
    "activeCardId" => "abc",
  },
  "playerData" => %{
    "player1" => %{"willpower" => 0},
    "player2" => %{"willpower" => 5}
  },
  "messages" => []
}

if false do
  code = "$ACTIVE_CARD_PATH"
  MyTest.assert(1, MyTest.evaluate(game, code), ["cardById", "abc"])

  code = ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 45]
  MyTest.assert(2, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 45)

  code = [["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 45],["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 65]]
  MyTest.assert(3, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 65)

  code = ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 0]
  MyTest.assert(4, MyTest.evaluate(game, code), true)

  code = ["COND", ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 0], ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 95]]
  MyTest.assert(5, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 95)

  code =
    [
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 0],
        [
            ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 90],
            ["GAME_ADD_MESSAGE","$playerN"," rotated ", ["OBJ_GET_BY_KEY", "$ACTIVE_FACE", "name"], " 90 degrees."]
        ],
        ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 90],
        [
            ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 0],
            ["GAME_ADD_MESSAGE","$playerN"," rotated ", ["OBJ_GET_BY_KEY", "$ACTIVE_FACE", "name"], " -90 degrees."]
        ]
      ],
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 0],
        [
            ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", 90],
            ["GAME_ADD_MESSAGE","$playerN"," rotated ", ["OBJ_GET_BY_KEY", "$ACTIVE_FACE", "name"], " 90 degrees."]
        ],
        ["EQUAL", ["OBJ_GET_BY_KEY", "$ACTIVE_CARD", "rotation"], 90],
        [
            ["GAME_SET_VAL", "$ACTIVE_CARD_PATH", "rotation", -10],
            ["GAME_ADD_MESSAGE","$playerN"," rotated ", ["OBJ_GET_BY_KEY", "$ACTIVE_FACE", "name"], " -90 degrees."]
        ]
      ]
    ]
  MyTest.assert(6, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], -10)

  code = ["OBJ_SET_VAL", "$ACTIVE_CARD", "rotation", 44]
  MyTest.assert(7, MyTest.evaluate(game, code)["rotation"], 44)

  code = ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH", ["GAME_SET_VAL", "$CARD_BY_ID_PATH", "$CARD_ID", ["OBJ_SET_VAL", "$CARD", "rotation", 77]]]
  MyTest.assert(8, MyTest.evaluate(game, code)["cardById"]["ghi"]["rotation"], 77)

  code = ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH", ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "rotation"], 77]]
  MyTest.assert(8, MyTest.evaluate(game, code)["cardById"]["ghi"]["rotation"], 77)

  code =
    ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH",
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "exhausted"], true],
        ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "rotation"], 77],
        true,
        "$GAME"
      ]
    ]
  MyTest.assert(9, MyTest.evaluate(game, code)["cardById"]["def"]["rotation"], 77)

  code =
    ["FOR_EACH_KEY_VAL_AT_PATH", "$PLAYER_I", "$PLAYER_I_DATA", ["playerData"],
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$PLAYER_I_DATA", "willpower"], 0],
        ["GAME_SET_VAL", ["LIST", "playerData", "$PLAYER_I", "willpower"], 22],
        true,
        "$GAME",
      ]
    ]
  MyTest.assert(10, MyTest.evaluate(game, code)["playerData"]["player1"]["willpower"], 22)
end

alias DragnCardsGame.GameUI
game_def = "./../frontend/src/features/plugins/lotrlcg/definitions/gameDefinition.json" |> File.read! |> Poison.decode!
gameui = GameUI.new("test", %{:id => 1}, %{"pluginUuid" => "10018538-89f9-49b9-9e28-af863a9e579c", "pluginVersion" => 1})
#IO.inspect(gameui)
cards = game_def["preBuiltDecks"]["Q01.1"]["cards"]

load_list = [
  %{
    "loadGroupId" => "player1Deck",
    "quantity" => 1,
    "uuid" => "myuuid",
    "cardDetails" => %{
      "A" => %{
        "attack" => "",
        "cardBack" => "encounter",
        "cost" => "",
        "deckbuilderQuantity" => 1,
        "defense" => "",
        "encounterSet" => "Dol Guldur Orcs",
        "engagementCost" => "",
        "hitPoints" => "",
        "imageUrl" => "https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/51223bd0-ffd1-11df-a976-0801200c9092.jpg",
        "keywords" => "",
        "name" => "Driven by Shadow",
        "numberInPack" => 92,
        "packName" => "Core Set",
        "questPoints" => "",
        "setUuid" => "51223bd0-ffd1-11df-a976-0801200c9000",
        "shadow\r" => "Shadow: Choose and discard 1 attachment from the defending character. (If this attack is undefended, discard all attachments you control.)\r",
        "sphere" => "",
        "text" => "When Revealed: Each enemy and each location currently in the staging area gets +1 [threat] until the end of the phase. If there are no cards in the staging area, Driven by Shadow gains surge.",
        "threat" => "",
        "traits" => "",
        "type" => "Treachery",
        "unique" => "",
        "uuid" => "51223bd0-ffd1-11df-a976-0801200c9092",
        "victoryPoints" => "",
        "willpower" => ""
      },
      "B" => %{
        "attack" => nil,
        "cardBack" => nil,
        "cost" => nil,
        "deckbuilderQuantity" => nil,
        "defense" => nil,
        "encounterSet" => nil,
        "engagementCost" => nil,
        "hitPoints" => nil,
        "imageUrl" => nil,
        "keywords" => nil,
        "name" => "encounter",
        "numberInPack" => nil,
        "packName" => nil,
        "questPoints" => nil,
        "setUuid" => nil,
        "shadow\r" => nil,
        "sphere" => nil,
        "text" => nil,
        "threat" => nil,
        "traits" => nil,
        "type" => nil,
        "unique" => nil,
        "uuid" => nil,
        "victoryPoints" => nil,
        "willpower" => nil
      }
    }
  },
  %{
    "loadGroupId" => "player1Deck",
    "quantity" => 3,
    "uuid" => "51223bd0-ffd1-11df-a976-0801200c9093",
    "cardDetails" => %{
      "A" => %{
        "attack" => "",
        "cardBack" => "encounter",
        "cost" => "",
        "deckbuilderQuantity" => 3,
        "defense" => "",
        "encounterSet" => "Dol Guldur Orcs",
        "engagementCost" => "",
        "hitPoints" => "",
        "imageUrl" => "https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/51223bd0-ffd1-11df-a976-0801200c9093.jpg",
        "keywords" => "",
        "name" => "The Necromancer's Reach",
        "numberInPack" => 93,
        "packName" => "Core Set",
        "questPoints" => "",
        "setUuid" => "51223bd0-ffd1-11df-a976-0801200c9000",
        "shadow\r" => "\r",
        "sphere" => "",
        "text" => "When Revealed: Deal 1 damage to each exhausted character.",
        "threat" => "",
        "traits" => "",
        "type" => "Treachery",
        "unique" => "",
        "uuid" => "51223bd0-ffd1-11df-a976-0801200c9093",
        "victoryPoints" => "",
        "willpower" => ""
      },
      "B" => %{
        "attack" => nil,
        "cardBack" => nil,
        "cost" => nil,
        "deckbuilderQuantity" => nil,
        "defense" => nil,
        "encounterSet" => nil,
        "engagementCost" => nil,
        "hitPoints" => nil,
        "imageUrl" => nil,
        "keywords" => nil,
        "name" => "encounter",
        "numberInPack" => nil,
        "packName" => nil,
        "questPoints" => nil,
        "setUuid" => nil,
        "shadow\r" => nil,
        "sphere" => nil,
        "text" => nil,
        "threat" => nil,
        "traits" => nil,
        "type" => nil,
        "unique" => nil,
        "uuid" => nil,
        "victoryPoints" => nil,
        "willpower" => nil
      }
    }
  },
  %{
    "loadGroupId" => "sharedEncounterDeck",
    "quantity" => 1,
    "uuid" => "51223bd0-ffd1-11df-a976-0801200c9099",
    "cardDetails" => %{
      "A" => %{
        "attack" => "",
        "cardBack" => "encounter",
        "cost" => "",
        "deckbuilderQuantity" => 2,
        "defense" => "",
        "encounterSet" => "Passage Through Mirkwood",
        "engagementCost" => "",
        "hitPoints" => "",
        "imageUrl" => "https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/51223bd0-ffd1-11df-a976-0801200c9099.jpg",
        "keywords" => "",
        "name" => "Old Forest Road",
        "numberInPack" => 99,
        "packName" => "Core Set",
        "questPoints" => 3,
        "setUuid" => "51223bd0-ffd1-11df-a976-0801200c9000",
        "shadow\r" => "\r",
        "sphere" => "",
        "text" => "Response: After you travel to Old Forest Road, the first player may choose and ready 1 character he controls.",
        "threat" => 1,
        "traits" => "Forest.",
        "type" => "Location",
        "unique" => "",
        "uuid" => "51223bd0-ffd1-11df-a976-0801200c9099",
        "victoryPoints" => "",
        "willpower" => ""
      },
      "B" => %{
        "attack" => nil,
        "cardBack" => nil,
        "cost" => nil,
        "deckbuilderQuantity" => nil,
        "defense" => nil,
        "encounterSet" => nil,
        "engagementCost" => nil,
        "hitPoints" => nil,
        "imageUrl" => nil,
        "keywords" => nil,
        "name" => "encounter",
        "numberInPack" => nil,
        "packName" => nil,
        "questPoints" => nil,
        "setUuid" => nil,
        "shadow\r" => nil,
        "sphere" => nil,
        "text" => nil,
        "threat" => nil,
        "traits" => nil,
        "type" => nil,
        "unique" => nil,
        "uuid" => nil,
        "victoryPoints" => nil,
        "willpower" => nil
      }
    }
  },
  %{
    "loadGroupId" => "player1Deck",
    "quantity" => 1,
    "uuid" => "51223bd0-ffd1-11df-a976-0801200c9096",
    "cardDetails" => %{
      "A" => %{
        "attack" => 2,
        "cardBack" => "encounter",
        "cost" => "",
        "deckbuilderQuantity" => 4,
        "defense" => 1,
        "encounterSet" => "Passage Through Mirkwood",
        "engagementCost" => 25,
        "hitPoints" => 4,
        "imageUrl" => "https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/51223bd0-ffd1-11df-a976-0801200c9096.jpg",
        "keywords" => "",
        "name" => "Forest Spider",
        "numberInPack" => 96,
        "packName" => "Core Set",
        "questPoints" => "",
        "setUuid" => "51223bd0-ffd1-11df-a976-0801200c9000",
        "shadow\r" => "Shadow: Defending player must choose and discard 1 attachment he controls.\r",
        "sphere" => "",
        "text" => "Forced: After Forest Spider engages a player, it gets +1 [attack] until the end of the round.",
        "threat" => 2,
        "traits" => "Creature. Spider.",
        "type" => "Enemy",
        "unique" => "",
        "uuid" => "51223bd0-ffd1-11df-a976-0801200c9096",
        "victoryPoints" => "",
        "willpower" => ""
      },
      "B" => %{
        "attack" => nil,
        "cardBack" => nil,
        "cost" => nil,
        "deckbuilderQuantity" => nil,
        "defense" => nil,
        "encounterSet" => nil,
        "engagementCost" => nil,
        "hitPoints" => nil,
        "imageUrl" => nil,
        "keywords" => nil,
        "name" => "encounter",
        "numberInPack" => nil,
        "packName" => nil,
        "questPoints" => nil,
        "setUuid" => nil,
        "shadow\r" => nil,
        "sphere" => nil,
        "text" => nil,
        "threat" => nil,
        "traits" => nil,
        "type" => nil,
        "unique" => nil,
        "uuid" => nil,
        "victoryPoints" => nil,
        "willpower" => nil
      }
    }
  }
]

gameui = GameUI.game_action(gameui, 1, "load_cards", %{"load_list" => load_list})
game = gameui["game"]
game = put_in(game, ["variables", "$i"], 1)
game = put_in(game, ["playerData", "player1", "cardsDrawn"], 2)
game = put_in(game["playerUi"], %{"playerN" => "player1"})
game = put_in(game["numPlayers"], 3)

stack_id = Enum.at(game["groupById"]["sharedEncounterDeck"]["stackIds"],0)
card_id = Enum.at(game["stackById"][stack_id]["cardIds"],0)

code = ["MOVE_CARD", card_id, "sharedVictory", 0, 0]
MyTest.assert(11, MyTest.evaluate(game, code)["cardById"][card_id]["groupId"], "sharedVictory")

code = ["FOR_EACH_START_STOP_STEP", "$i", 1, 30, 2, ["GAME_ADD_MESSAGE", "$i"]]
MyTest.assert(12, MyTest.evaluate(game, code)["variables"]["$i"], 29)

code = ["FOR_EACH_START_STOP_STEP", "$i", 0, 10, 1, ["MOVE_CARD", ["GET_CARD_ID", "sharedEncounterDeck", 0, 0], "sharedVictory", 0, 0]]
MyTest.assert(13, Enum.count(MyTest.evaluate(game, code)["groupById"]["sharedVictory"]["stackIds"]), 1)

code = ["NEXT_PLAYER", ["NEXT_PLAYER", ["NEXT_PLAYER", ["GAME_GET_VAL", ["LIST", "firstPlayer"]]]]]
MyTest.assert(14, MyTest.evaluate(game, code), "player1")


actions = %{
  "newRound" => [
    ["COND",
      ["EQUAL", ["GAME_GET_VAL", ["LIST", "playerData", "$PLAYER_N", "refreshed"]], false],
      ["ACTION_LIST", "refresh"],
      true,
      "$GAME"
    ],
    ["COND",
      ["EQUAL", ["GAME_GET_VAL", ["LIST", "playerUi", "playerN"]], "player1"],
      [
        ["GAME_INCREASE_VAL", ["roundNumber"], 1],
        ["GAME_ADD_MESSAGE", "player1 increased the round."],
        ["GAME_SET_VAL", ["phase"], "Resource"],
        ["GAME_ADD_MESSAGE", "player1 set the phase to Resource."],
        ["GAME_SET_VAL", ["roundStep"], "1.R"],
        ["GAME_ADD_MESSAGE", "player1 set the round step to 1.R."]
      ],
      true,
      "$GAME"
    ],
    ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH", [
      ["COND",
        ["AND",
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "type"], "Hero"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "inPlay"], true],
        ],
        [
          ["GAME_INCREASE_VAL", ["LIST", "cardById", "$CARD_ID", "tokens", "resource"], 1],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " added 1 resource token to ", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "name"], "."],
        ],
        true,
        "$GAME"
      ],
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
        ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "committed"], false],
        true,
        "$GAME"
      ],
      ["COND",
        ["AND",
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "inPlay"], true],
        ],
        [
          ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "tokens", "resource"], 1], #["OBJ_GET_VAL", "$CARD", "extraResources"]],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " added ", ["OBJ_GET_VAL", "$CARD", "extraResources"]," extra resource token(s) to ", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "type"]]
        ],
        true,
        "$GAME"
      ],
    ]],
    ["FOR_EACH_START_STOP_STEP", "$i", 0, ["GAME_GET_VAL", ["LIST", "playerData", "player1", "cardsDrawn"]], 1,
      [
        ["MOVE_CARD", ["GET_CARD_ID", ["JOIN_STRING", "$PLAYER_N", "Deck"], 0, 0], ["JOIN_STRING", "$PLAYER_N", "Hand"], 0, 0],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " drew 1 card."]
      ]
    ],
    ["GAME_SET_VAL", ["LIST", "playerData", "$PLAYER_N", "willpower"], 0],
    ["GAME_SET_VAL", ["LIST", "playerData", "$PLAYER_N", "refreshed"], false],
  ],
  "refresh" => [
    ["COND",
      ["EQUAL", ["GAME_GET_VAL", ["LIST", "playerUi", "playerN"]], "player1"],
      [
        ["GAME_SET_VAL", ["LIST", "phase"], "Refresh"],
        ["GAME_SET_VAL", ["LIST", "roundStep"], "7.R"],
        ["GAME_SET_VAL", ["LIST", "firstPlayer"], ["NEXT_PLAYER", ["GAME_GET_VAL", ["LIST", "firstPlayer"]]]],
        ["GAME_ADD_MESSAGE", "player1 set the phase to Refresh."],
        ["GAME_ADD_MESSAGE", "player1 set the round step to 7.R."]
      ],
      true,
      "$GAME"
    ],
    ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH", [
      ["COND",
        ["AND",
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "inPlay"], true],
        ],
        [
          ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "rotation"], 0],
          ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "exhausted"], false]
        ],
        true,
        "$GAME"
      ],
    ]],
    ["GAME_SET_VAL", ["LIST", "playerData", "$PLAYER_N", "refreshed"], true],
    ["GAME_ADD_MESSAGE", "player1 refeshed."]
  ],
  "revealEncounterFaceup" => [
    ["DEFINE", "$REVEAL_FACEDOWN", false],
    ["ACTION_LIST", "revealEncounter"],
  ],
  "revealEncounterFacedown" => [
    ["DEFINE", "$REVEAL_FACEDOWN", false],
    ["ACTION_LIST", "revealEncounter"],
  ],
  "revealSecondaryFaceup" => [
    ["DEFINE", "$REVEAL_FACEDOWN", false],
    ["ACTION_LIST", "revealSecondary"],
  ],
  "revealSecondaryFacedown" => [
    ["DEFINE", "$REVEAL_FACEDOWN", false],
    ["ACTION_LIST", "revealSecondary"],
  ],
  "revealEncounter" => [
    ["COND",
      ["EQUAL", ["LENGTH", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDeck", "stackIds"]]], 0],
      ["COND",
        ["EQUAL", ["GAME_GET_VAL", ["LIST", "phase"]], "Quest"],
        [
          ["MOVE_STACKS", "sharedEncounterDiscard", "sharedEncounterDeck", ["LENGTH", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDiscard", "stackIds"]]], "shuffle"],
          ["GAME_ADD_MESSAGE", "$PLAYER_N"," shuffled the encounter discard pile into the encounter deck."]
        ],
        true,
        ["GAME_ADD_MESSAGE", "$PLAYER_N", "tried to reveal a card, but the encounter deck is empty and it's not the quest phase."]
      ],
      true,
      [
        ["DEFINE", "$STACK_ID", ["AT_INDEX", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDeck", "stackIds"]], 0]],
        ["MOVE_STACK", "$STACK_ID", "sharedStaging", -1, false, "$REVEAL_FACEDOWN"],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " revealed ", ["FACEUP_NAME_FROM_STACK_ID", "$STACK_ID"]]
      ]
    ],
    ["COND",
      ["EQUAL", ["LENGTH", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDeck", "stackIds"]]], 0],
      [
        ["MOVE_STACKS", "sharedEncounterDiscard", "sharedEncounterDeck", ["LENGTH", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDiscard", "stackIds"]]], "shuffle"],
        ["GAME_ADD_MESSAGE", "$PLAYER_N"," shuffled the encounter discard pile into the encounter deck."]
      ],
      true,
      "$GAME"
    ]
  ],
  "revealSecondary" => [
    ["COND",
      ["EQUAL", ["LENGTH", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDeck2", "stackIds"]]], 0],
      ["GAME_ADD_MESSAGE", "$PLAYER_N", " tried to reveal a card from the second encounter deck, but it's empty."],
      true,
      [
        ["DEFINE", "$STACK_ID", ["AT_INDEX", ["GAME_GET_VAL", ["LIST", "groupById", "sharedEncounterDeck2", "stackIds"]], 0]],
        ["MOVE_STACK", "$STACK_ID", "sharedStaging", -1, false, "$REVEAL_FACEDOWN"],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", " revealed ", ["FACEUP_NAME_FROM_STACK_ID", "$STACK_ID"]]
      ]
    ]
  ],
  "draw" => [
    ["MOVE_CARD", ["GET_CARD_ID", ["JOIN_STRING", "$PLAYER_N", "Deck"], 0, 0], ["JOIN_STRING", "$PLAYER_N", "Hand"], 0, 0],
  ],
  "shadows" => [
    ["FOR_EACH_KEY_VAL_AT_PATH", "$PLAYER_DATA", "$PLAYER_I", "$PLAYER_I_DATA", [
      ["COND",
        ["AND",
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "type"], "Hero"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "inPlay"], true],
        ],
        [
          ["GAME_INCREASE_VAL", ["LIST", "cardById", "$CARD_ID", "tokens", "resource"], 1],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " added 1 resource token to ", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "name"], "."],
        ],
        true,
        "$GAME"
      ],
      ["COND",
        ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
        ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "committed"], false],
        true,
        "$GAME"
      ],
      ["COND",
        ["AND",
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "controller"], "playerN"],
          ["EQUAL", ["OBJ_GET_BY_KEY", "$CARD", "inPlay"], true],
        ],
        [
          ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "tokens", "resource"], 1], #["OBJ_GET_VAL", "$CARD", "extraResources"]],
          ["GAME_ADD_MESSAGE", "$PLAYER_N", " added ", ["OBJ_GET_VAL", "$CARD", "extraResources"]," extra resource token(s) to ", ["OBJ_GET_BY_KEY", "$CARD", "sides", ["OBJ_GET_BY_KEY", "$CARD", "currentSide"], "type"]]
        ],
        true,
        "$GAME"
      ],
    ]],
  ]

}

game = put_in(game["actionLists"], actions)

MyTest.assert(15, MyTest.evaluate(game, actions["newRound"])["roundStep"], "1.R")


MyTest.assert(16, MyTest.evaluate(game, actions["refresh"])["roundStep"], "7.R")
IO.inspect(MyTest.evaluate(game, actions["refresh"])["messages"])

#MyTest.assert(16, MyTest.evaluate(game, actions["reveal"])["groupById"]["sharedStaging"], "7.R")
IO.inspect(game["groupById"]["sharedEncounterDeck"])
IO.inspect(game["groupById"]["sharedStaging"])
game = MyTest.evaluate(game, actions["revealEncounterFaceup"])
IO.inspect(game["groupById"]["sharedEncounterDeck"])
IO.inspect(game["groupById"]["sharedStaging"])
game = MyTest.evaluate(game, actions["revealSecondaryFacedown"])
IO.inspect(game["groupById"]["sharedEncounterDeck"])
IO.inspect(game["groupById"]["sharedStaging"])
IO.inspect(game["messages"])
#IO.inspect(MyTest.evaluate(game, actions["reveal"])["groupById"]["sharedStaging"])
#IO.inspect(MyTest.evaluate(game, actions["reveal"])["messages"])

#code = ["GET_CARD_ID", "sharedEncounterDeck", 0, 0]
#r = MyTest.evaluate(game, code)
#IO.inspect(r)
#MyTest.assert(13, MyTest.evaluate(game, code)["variables"]["$i"], 29)

code = [
  ["DEFINE", "$I", 0],
  ["FOR_EACH_KEY_VAL_AT_PATH", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH",
    [
      ["GAME_SET_VAL", ["LIST", "cardById", "$CARD_ID", "rotation"], "$I"],
      ["DEFINE", "$I", ["ADD", "$I", 1]]
    ],
    ["id"],
    "DESC"
  ]
]
r = MyTest.evaluate(game, code)
#sortedbyid = evaluate(game, ["cardById"], fn({card_id, card}) -> get_in(card, ["id"]) end)
Enum.reduce(r["cardById"], nil, fn({card_id, card}, acc) ->
  IO.inspect("#{card_id} #{card["rotation"]}")
end)
#MyTest.assert(8, MyTest.evaluate(game, code), nil)

#code = ["ACTIONS", ["SET","$ACTIVE_CARD_PATH","rotation",10],["SET","$ACTIVE_CARD_PATH","rotation",20],["GAME_ADD_MESSAGE","testprint"],["GAME_ADD_MESSAGE","testprint2"]]
#r = MyTest.evaluate(game, code)
#IO.inspect(r)
#r = try do
#  MyTest.evaluate(game, code3)
#rescue
#  e ->
#    message = "Failed to resolve: " <> inspect(code3) <> ". Error: " <> inspect(e)
#    put_in(game["error"],String.replace(message,"\"","'"))
#end

#IO.inspect(r)
