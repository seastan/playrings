defmodule DragnCards.Plugins do
  @moduledoc """
  The Plugins context.
  """

  import Ecto.Query, warn: false
  alias DragnCards.Repo

  alias DragnCards.{Plugins.Plugin, Users.User}

  @doc """
  Returns the list of plugins.

  ## Examples

      iex> list_plugins()
      [%Plugin{}, ...]
  """

  def list_plugins_info(user_id) do
    IO.puts("list_plugins_info 0")
    IO.inspect(user_id)
    IO.puts("list_plugins_info 1")
    query = from p in Plugin,
    join: u in User,
    on: [id: p.author_id],
    order_by: [desc: :version],
    where: p.public == true or p.author_id == ^user_id,
    select: {
      p.author_id,
      u.alias,
      p.id,
      p.name,
      p.version,
      p.num_favorites,
      p.public,
      p.updated_at,
      p.game_def["announcements"],
      p.game_def["tutorialUrl"]
    }
    Repo.all(query)
  end

  def get_plugin_info(id) do
    query = from p in Plugin,
    join: u in User,
    on: [id: p.author_id],
    order_by: [desc: :version],
    where: [public: true, id: ^id],
    select: {
      p.author_id,
      u.alias,
      p.id,
      p.name,
      p.version,
      p.num_favorites,
      p.public,
      p.updated_at,
      p.game_def["announcements"],
      p.game_def["tutorialUrl"]
    }
    Repo.one(query)
  end

  def list_plugins do
    Repo.all(Plugin)
  end

  def get_game_def(id) do
    query = from p in Plugin,
    where: [id: ^id],
    select: {
      p.game_def
    }
    case Repo.one(query) do
      nil -> nil
      query_result -> elem(query_result, 0)
    end
  end

  def get_card_db(id) do
    query = from p in Plugin,
    where: [id: ^id],
    select: {
      p.card_db
    }
    case Repo.one(query) do
      nil -> nil
      query_result -> elem(query_result, 0)
    end
  end

  @doc """
  Gets a single plugin.

  Raises `Ecto.NoResultsError` if the Plugin does not exist.

  ## Examples

      iex> get_plugin!(123)
      %Plugin{}

      iex> get_plugin!(456)
      ** (Ecto.NoResultsError)

  """
  def get_plugin!(id), do: Repo.get!(Plugin, id)

  @doc """
  Creates a plugin.

  ## Examples

      iex> create_plugin(%{field: value})
      {:ok, %Plugin{}}

      iex> create_plugin(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_plugin(attrs \\ %{}) do
    %Plugin{}
    |> Plugin.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a plugin.

  ## Examples

      iex> update_plugin(plugin, %{field: new_value})
      {:ok, %Plugin{}}

      iex> update_plugin(plugin, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_plugin(%Plugin{} = plugin, attrs) do
    plugin
    |> Plugin.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a plugin.

  ## Examples

      iex> delete_plugin(plugin)
      {:ok, %Plugin{}}

      iex> delete_plugin(plugin)
      {:error, %Ecto.Changeset{}}

  """
  def delete_plugin(%Plugin{} = plugin) do
    Repo.delete(plugin)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking plugin changes.

  ## Examples

      iex> change_plugin(plugin)
      %Ecto.Changeset{data: %Plugin{}}

  """
  def change_plugin(%Plugin{} = plugin, attrs \\ %{}) do
    Plugin.changeset(plugin, attrs)
  end
end
