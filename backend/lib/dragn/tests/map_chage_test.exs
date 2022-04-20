defmodule MyTest do
  def get_nested_value(map, key_list) do
    flat_key_list = flatten_key_list(map, key_list)
    get_in(map, flat_key_list)
  end

  def flatten_key_list(map, key_list) do
    Enum.reduce(key_list, [], fn(key, acc) ->
      acc ++ if is_list(key) do
        [get_nested_value(map, key)]
      else
        [key]
      end
    end)
  end

  def change_map(map, options) do
    action = options["action"]
    new_map = case action do
      "setValue" ->
        if Map.has_key?(options, "key_list") and Map.has_key?(options, "value") do
          flat_key_list = flatten_key_list(map, options["key_list"])
          value = options["value"]
          put_in(map, flat_key_list, value)
        else map end
      "increaseBy" ->
        if Map.has_key?(options, "key_list") and Map.has_key?(options, "value") do
          flat_key_list = flatten_key_list(map, options["key_list"])
          old_value = get_nested_value(map, flat_key_list)
          value = get_nested_value(map, )
          put_in(map, flat_key_list, value)
        else map end
    end
    IO.inspect(new_map)
  end
end

gameui = %{
  "game" => %{
    "cardById" => %{
      "abc" => %{
        "exhausted" => True
      }
    }
  },
  "playerUi" => %{
    "activeCardId" => "abc",
  }
}

action = "setValue"

key_list = ["game", "cardById", ["playerUi", "activeCardId"], "exhausted"]

value = False

options = %{
  "action" => action,
  "key_list" => key_list,
  "value" => value,
}

MyTest.change_map(gameui, options)
