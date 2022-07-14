defmodule MyTest do
  def assert(test_num, evaluated, result) do
    if evaluated != result do
      raise "failed test #{test_num}"
    else
      IO.puts("passed test #{test_num}")
    end
  end

  def evaluate(game, code) do
    IO.puts("evaluate")
    IO.inspect(code)
    if is_list(code) && Enum.count(code) > 0 do
      IO.puts("is_list")
      if is_list(Enum.at(code, 0)) do
        #actions = Enum.slice(code, 1, Enum.count(code))
        Enum.reduce(code, game, fn(action, acc) ->
          evaluate(acc, action)
        end)
      else
        code = Enum.reduce(code, [], fn(code_line, acc) ->
          IO.puts("evaluating")
          IO.inspect(code_line)
          acc ++ [evaluate(game, code_line)]
        end)

        IO.puts("resolving function")
        IO.inspect(code)
        case Enum.at(code,0) do
          "LIST" ->
            Enum.slice(code, 1, Enum.count(code))
          "EQUAL" ->
            Enum.at(code,1) == Enum.at(code,2)
          "NOT" ->
            !Enum.at(code,1)
          "ADD" ->
            Enum.at(code,1) + Enum.at(code,2)
          "SUBTRACT" ->
            Enum.at(code,1) - Enum.at(code,2)
          "MULTIPLY" ->
            Enum.at(code,1) * Enum.at(code,2)
          "DIVIDE" ->
            Enum.at(code,1) / Enum.at(code,2)
          "GET" ->
            map = Enum.at(code,1)
            key = Enum.at(code,2)
            if not Map.has_key?(map,key) do
              raise(inspect(map) <> " does not have key '" <> key <> "'.")
            else
              map[key]
            end
          "SET" ->
            path = Enum.at(code,1)
            key = Enum.at(code,2)
            value = Enum.at(code,3)
            put_in(game, path ++ [key], value)
          "COND" ->
            ifthens = Enum.slice(code, 1, Enum.count(code))
            then = Enum.reduce_while(0..Enum.count(ifthens)-1//2, game, fn(i, acc) ->
              if Enum.at(ifthens, i) do
                {:halt, Enum.at(ifthens, i+1)}
              else
                {:cont, acc}
              end
            end)
            #IO.puts("COND then")
            #IO.inspect("then")
            #evaluate(game, then)
          "PRINT" ->
            statements = Enum.slice(code, 1, Enum.count(code))
            message = Enum.reduce(statements, "", fn(statement, acc) ->
              acc <> statement
            end)
            put_in(game["messages"], game["messages"] ++ [message])
          _ ->
            code
        end
      end
    else # value
      IO.puts("parsing value #{code}")
      case code do
        "$GAME" ->
          game
        "$CARD_BY_ID" ->
          game["cardById"]
        "$ACTIVE_CARD_PATH" ->
          ["cardById", game["playerUi"]["activeCardId"]]
        "$ACTIVE_FACE_PATH" ->
          active_card = evaluate(game, "$ACTIVE_CARD")
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["sides", active_card["currentSide"]]
        "$ACTIVE_TOKENS_PATH" ->
          evaluate(game, "$ACTIVE_CARD_PATH") ++ ["tokens"]
        "$ACTIVE_CARD" ->
          get_in(game, evaluate(game, "$ACTIVE_CARD_PATH"))
        "$ACTIVE_FACE" ->
          get_in(game, evaluate(game, "$ACTIVE_FACE_PATH"))
        "$ACTIVE_TOKENS" ->
          get_in(game, evaluate(game, "$ACTIVE_TOKENS_PATH"))
        _ ->
          code
      end
    end
  end
end

game = %{
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
      "exhausted" => True,
      "tokens" => %{
        "damage" => 1
      }
    },
    "ghi" => %{
      "exhausted" => False,
      "tokens" => %{
        "damage" => 1
      }
    }
  },
  "playerUi" => %{
    "activeCardId" => "abc",
  },
  "messages" => []
}

_code = [
  ["COND",
      ["EQUAL", ["ACTIVE_CARD", "inPlay"], true],
      ["COND",
        ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
        [
            ["SET", "$ACTIVE_CARD", "rotation", 90],
            ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
        ],
        ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
        [
            ["SET", "$ACTIVE_CARD", "rotation", 0],
            ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
        ],
      ]
  ]
]

code = "$ACTIVE_CARD_PATH"
MyTest.assert(1, MyTest.evaluate(game, code), ["cardById", "abc"])

code = ["SET", "$ACTIVE_CARD_PATH", "rotation", 45]
MyTest.assert(2, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 45)

code = [["SET", "$ACTIVE_CARD_PATH", "rotation", 45],["SET", "$ACTIVE_CARD_PATH", "rotation", 65]]
MyTest.assert(3, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 65)

code = ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0]
MyTest.assert(4, MyTest.evaluate(game, code), true)


code = ["COND", ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0], ["SET", "$ACTIVE_CARD_PATH", "rotation", 95]]
MyTest.assert(5, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], 95)

code =
  [
    ["COND",
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
      [
          ["SET", "$ACTIVE_CARD_PATH", "rotation", 90],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
      ],
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
      [
          ["SET", "$ACTIVE_CARD_PATH", "rotation", 0],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " -90 degrees."]
      ]
    ],
    ["COND",
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 0],
      [
          ["SET", "$ACTIVE_CARD_PATH", "rotation", 90],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " 90 degrees."]
      ],
      ["EQUAL", ["GET", "$ACTIVE_CARD", "rotation"], 90],
      [
          ["SET", "$ACTIVE_CARD_PATH", "rotation", -10],
          ["PRINT","$playerN"," rotated ", ["GET", "$ACTIVE_FACE", "name"], " -90 degrees."]
      ]
    ]
  ]
MyTest.assert(6, MyTest.evaluate(game, code)["cardById"]["abc"]["rotation"], -10)

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
