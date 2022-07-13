defmodule MyTest do
  def

  def evaluate(game, code) do
    try do
      if is_list(code) && Enum.count(code) > 0 do
        code = Enum.reduce(code, [], fn(code_line, acc) ->
          acc ++ [evaluate(game, code_line)]
        end)
        item0 = Enum.at(code,0)
        case item0 do
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
              raise("#{code}")
            else
              map[key]
            end
          "SET" ->
            put_in(game, Enum.at(code,1), Enum.at(code,1))
        end
      else # value
        case code do
          "$GAME" ->
            game
          "$CARD_BY_ID" ->
            game["cardById"]
          "$ACTIVE_CARD" ->
            game["cardById"][game["playerUi"]["activeCardId"]]
          "$ACTIVE_FACE" ->
            active_card = game["cardById"][game["playerUi"]["activeCardId"]]
            active_card["sides"][active_card["currentSide"]]
          _ ->
            code
        end
      end
    rescue
      e ->
        IO.puts("ERROR: Could not resolve #{e}")
    end
  end
end

game = %{
  "cardById" => %{
    "abc" => %{
      "exhausted" => True,
      "tokens" => %{
        "damage" => 1
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
  }
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

_code2 = ["EQUAL",["MINUS",["PLUS", 1, 1],4],-2]
code3 = ["GET","$ACTIVE_CARD","exhausted2"]
r = MyTest.evaluate(game, code3)
IO.inspect(r)
