defmodule DragnCardsGame.Groups do
  @moduledoc """

  """

  @type t :: Map.t()

  @doc """
  """
  @spec new(Map.t()) :: Map.t()
  def new(groups) do
    Enum.reduce(groups, %{}, fn({group_id, group_info}, acc) ->
      acc
      |> put_in([group_id], group_info)
      |> put_in([group_id, "stackIds"], [])
      |> put_in([group_id, "id"], group_id)
    end)
  end

end
