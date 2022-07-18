defmodule MyTest do
  alias DragnCardsGame.{Game, Stack, GameUI}

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
          "LIST" ->
            list = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce(list, [], fn(item,acc)->
              acc ++ [evaluate(game, item)]
            end)
          "LENGTH" ->
            Enum.count(Enum.at(code,1))
          "EQUAL" ->
            evaluate(game, Enum.at(code,1)) == evaluate(game, Enum.at(code,2))
          "NOT" ->
            !evaluate(game, Enum.at(code,1))
          "ADD" ->
            evaluate(game, Enum.at(code,1)) + evaluate(game, Enum.at(code,2))
          "SUBTRACT" ->
            evaluate(game, Enum.at(code,1)) - evaluate(game, Enum.at(code,2))
          "MULTIPLY" ->
            evaluate(game, Enum.at(code,1)) * evaluate(game, Enum.at(code,2))
          "DIVIDE" ->
            evaluate(game, Enum.at(code,1)) / evaluate(game, Enum.at(code,2))
          "GET" ->
            map = evaluate(game, Enum.at(code,1))
            key = evaluate(game, Enum.at(code,2))
            # if not Map.has_key?(map,key) do
            #   raise(inspect(map) <> " does not have key '" <> key <> "'.")
            # else
            map[key]
            # end
          "SET" ->
            obj = evaluate(game, Enum.at(code,1))
            key = evaluate(game, Enum.at(code,2))
            value = evaluate(game, Enum.at(code,3))
            put_in(obj[key], value)
          "UPDATE" ->
            case Enum.count(code) do
              3 ->
                path = evaluate(game, Enum.at(code,1))
                value = evaluate(game, Enum.at(code,2))
                IO.puts("putting")
                IO.inspect(value)
                IO.inspect(path)
                put_in(game, path, value)
              4 ->
                path = evaluate(game, Enum.at(code,1))
                key = evaluate(game, Enum.at(code,2))
                value = evaluate(game, Enum.at(code,3))
                put_in(game, path ++ [key], value)
            end
          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            Enum.reduce_while(0..Enum.count(ifthens)-1//2, nil, fn(i, acc) ->
              if evaluate(game, Enum.at(ifthens, i)) == true do
                IO.inspect(Enum.at(ifthens, i))
                IO.puts("was true")
                {:halt, evaluate(game, Enum.at(ifthens, i+1))}
              else
                {:cont, nil}
              end
            end)
            #IO.puts("COND then")
            #IO.inspect("then")
            #evaluate(game, then)
          "PRINT" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = Enum.reduce(statements, "", fn(statement, acc) ->
              acc <> evaluate(game, statement)
            end)
            put_in(game["messages"], game["messages"] ++ [message])
          "FOR_EACH_KEY_VAL" ->
            key_name = evaluate(game, Enum.at(code, 1))
            val_name = evaluate(game, Enum.at(code, 2))
            obj_path = evaluate(game, Enum.at(code, 3))
            function = Enum.at(code, 4)
            old_obj = get_in(game, obj_path)
            new_obj = Enum.reduce(old_obj, %{}, fn({key, val}, acc) ->
              game = put_in(game, ["variables", key_name], key)
              game = put_in(game, ["variables", val_name], val)
              new_val = evaluate(game, function)
              put_in(acc[key], new_val)
            end)
          "MOVE_CARD" ->
            argc = Enum.count(code) - 1
            card_id = evaluate(game, Enum.at(code, 1))
            dest_group_id = evaluate(game, Enum.at(code, 2))
            dest_stack_index = evaluate(game, Enum.at(code, 3))
            dest_card_index = evaluate(game, Enum.at(code, 4))
            combine = if argc == 5 do evaluate(game, Enum.at(code, 5)) else nil end
            preserve_state = if argc == 6 do evaluate(game, Enum.at(code, 6)) else nil end
            GameUI.move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine, preserve_state)

          _ ->
            code
        end
      end
    else # value
      #IO.puts("parsing value #{code}")
      cond do
        code == "$GAME" ->
          game
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
        Map.has_key?(game["variables"], code) ->
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


_game2 = %{
  "cardById" => %{
    "abc" => %{
      "currentSide" => "A",
      "rotation" => 0,
      "sides" => %{"A" => %{"name" => "testname"}},
      "tokens" => %{"damage" => 1}
    },
    "def" => %{"exhausted" => true, "tokens" => %{"damage" => 1}},
    "ghi" => %{"exhausted" => false, "tokens" => %{"damage" => 1}}
  },
  "messages" => [],
  "playerUi" => %{"activeCardId" => "abc"},
  "variables" => %{
    "$CARD" => %{"exhausted" => false, "tokens" => %{"damage" => 1}}
  }
}
_code2 = [
  "COND",
  ["EQUAL", ["GET", "$CARD", "exhausted"], False],
  ["SET", "$CARD", "rotation", 77],
  [true],
  ["$CARD"]
]
_code2 = [["UPDATE",["variables"],"x",1],["UPDATE",["variables"],"y",2]]
#r = MyTest.evaluate(game2, code2)
#IO.inspect(r)

#raise "stop"

code = "$ACTIVE_CARD_PATH"
MyTest.assert(1, MyTest.evaluate(game, code), ["cardById", "abc"])

code = ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 45]
MyTest.assert(2, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 45)

code = [["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 45],["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 65]]
MyTest.assert(3, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 65)

code = ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0]
MyTest.assert(4, MyTest.evaluate(game, code), true)

code = ["COND", ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0], ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 95]]
MyTest.assert(5, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 95)

code =
  [
    ["COND",
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
      [
          ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 90],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
      ],
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
      [
          ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 0],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " -90 degrees."]
      ]
    ],
    ["COND",
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
      [
          ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", 90],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
      ],
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
      [
          ["UPDATE", "$ACTIVE_CARD_PATH", "rotation", -10],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " -90 degrees."]
      ]
    ]
  ]
MyTest.assert(6, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], -10)

code = ["SET", "$ACTIVE_CARD", "rotation", 44]
MyTest.assert(7, MyTest.evaluate(game, code)["rotation"], 44)

code = ["UPDATE", "$CARD_BY_ID_PATH", ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH", ["SET", "$CARD", "rotation", 77]]]
MyTest.assert(8, MyTest.evaluate(game, code)["cardById"]["ghi"]["rotation"], 77)

code = ["UPDATE", "$CARD_BY_ID_PATH",
  ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID_PATH",
    ["COND",
      ["EQUAL", ["GET", "$CARD", "exhausted"], true],
      ["SET", "$CARD", "rotation", 77],
      true,
      "$CARD"
    ]
  ]
]
MyTest.assert(9, MyTest.evaluate(game, code)["cardById"]["def"]["rotation"], 77)

code = ["UPDATE", ["playerData"],
  ["FOR_EACH_KEY_VAL", "$PLAYER_I", "$PLAYER_I_DATA", ["playerData"],
    ["COND",
      ["EQUAL", ["GET", "$PLAYER_I_DATA", "willpower"], 0],
      ["SET", "$PLAYER_I_DATA", "willpower", 22],
      true,
      "$PLAYER_I_DATA"
    ]
  ]
]
MyTest.assert(10, MyTest.evaluate(game, code)["playerData"]["player1"]["willpower"], 22)

import DragnCardsGame.GameUI
alias DragnCardsGame.GameUI
game_def = "./../frontend/src/features/plugins/lotrlcg/definitions/gameDefinition.json" |> File.read! |> Poison.decode!
gameui = GameUI.new("test", %{:id => 1}, %{"pluginUuid" => "10018538-89f9-49b9-9e28-af863a9e579c", "pluginVersion" => 1})
#IO.inspect(gameui)
cards = game_def["preBuiltDecks"]["Q01.1"]["cards"]

load_list = [
  %{
    "loadGroupId" => "sharedEncounterDeck",
    "quantity" => 1,
    "uuid" => "51223bd0-ffd1-11df-a976-0801200c9092",
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
    "loadGroupId" => "sharedEncounterDeck",
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
    "loadGroupId" => "sharedStaging",
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
    "loadGroupId" => "sharedStaging",
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
IO.inspect(gameui["game"]["cardById"])

#MyTest.assert(8, MyTest.evaluate(game, code), nil)

#code = ["ACTIONS", ["SET","$ACTIVE_CARD_PATH","rotation",10],["SET","$ACTIVE_CARD_PATH","rotation",20],["PRINT","testprint"],["PRINT","testprint2"]]
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
