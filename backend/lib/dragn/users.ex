defmodule DragnCards.Users do
  @moduledoc """
  The Users context.
  """

  import Ecto.Query, warn: false
  alias DragnCards.Repo

  alias DragnCards.Users.User

  @doc """
  Gets a single user by id.
  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %user{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Gets a single user by id.
  Returns nil if that user does not exist.
  """
  def get_user(id), do: Repo.get(User, id)

  def get_supporter_level(user_id) do
    user = get_user(user_id)
    if user == nil or user.supporter_level == nil do
      0
    else
      user.supporter_level
    end
  end
end
