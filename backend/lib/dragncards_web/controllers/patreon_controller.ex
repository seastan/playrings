defmodule DragnCardsWeb.PatreonController do
  use DragnCardsWeb, :controller
  alias DragnCards.{Users, Repo, Users.User}
  alias Plug.Conn

  # def patreon_callback(conn, params) do
  #   IO.puts("here =============================================================================================================")
  #   IO.inspect(params)
  # end

  def patreon_callback(conn, %{"code" => code}) do
    IO.puts("here =============================================================================================================")
    IO.inspect(code)
    IO.inspect(conn.assigns)
    token = request_access_token(code)
    IO.puts("----------------------------- patreon callback 1")
    profile = fetch_user_profile(token)
    # If the profile contains a data field then the token is valid
    # Otherwise, the token is invalid
    case profile do
      %{"data" => _} ->
        conn
        |> json(%{error: %{message: "Failed to link Patreon account. Token expired."}})
      _ ->
        IO.puts("----------------------------- patreon callback 2")
        IO.inspect(profile)
        amount_cents = get_amount_from_profile(profile)
        case amount_cents do
          nil ->
            conn
            |> json(%{error: %{message: "Failed to link Patreon account. Token expired."}})
          _ ->
            IO.puts("----------------------------- patreon callback 3")
            IO.inspect(amount_cents)
            # Divide by 100 (round up)
            amount_dollars = amount_cents / 100.0 |> ceil()
            update_user_supporter_level(conn, amount_dollars)
        end

    end



  end

  defp request_access_token(code) do
    IO.puts("----------------------------- request_access_token 1")
    # Get client secret from environment variable fromprod.exs
    patreon_client_id = Application.get_env(:dragncards, :patreon_client_id)
    patreon_client_secret = Application.get_env(:dragncards, :patreon_client_secret)
    patreon_redirect_uri = Application.get_env(:dragncards, :patreon_redirect_uri)
    IO.inspect(patreon_client_id)
    IO.inspect(patreon_client_secret)
    IO.inspect(patreon_redirect_uri)
    body = [
      {"code", code},
      {"grant_type", "authorization_code"},
      {"client_id", patreon_client_id},
      {"client_secret", patreon_client_secret},
      {"redirect_uri", patreon_redirect_uri}
    ]
    |> URI.encode_query()
    IO.puts("----------------------------- request_access_token 2")

    headers = [{"Content-Type", "application/x-www-form-urlencoded"}]
    http_response = HTTPoison.post("https://www.patreon.com/api/oauth2/token", body, headers)
    IO.inspect(http_response)

    case http_response do
      {:ok, %HTTPoison.Response{body: body}} ->
        IO.puts("----------------------------- request_access_token 3")
        IO.inspect(body)
        res = Poison.decode!(body)
        res["access_token"]
      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.puts("----------------------------- request_access_token 3b")
        IO.puts("HTTP Request failed: #{inspect reason}")
        nil
    end
  end


  def fetch_user_profile(access_token) do
    IO.puts("----------------------------- fetch_user_profile 0")
    headers = [{"Authorization", "Bearer #{access_token}"}]
    case HTTPoison.get("https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Bmember%5D=currently_entitled_amount_cents", headers) do
      {:ok, response} ->
        IO.puts("----------------------------- fetch_user_profile 1")
        # Assuming you want to work with the response body as a string
        response_body = response.body
        IO.puts("response_body")
        IO.inspect(response_body)
        Poison.decode!(response_body)
      {:error, _error} ->
        nil
    end
  end

  def get_amount_from_profile(profile) do
    included = Map.get(profile, "included", [])
    # Loop over included to find the membership
    membership = included |> Enum.find(fn x -> x["id"] == "38f2b2d6-1f10-454d-b1ad-e2fcc33d9cb4" end)
    amount = case membership do
      %{"attributes" => %{"currently_entitled_amount_cents" => amount}} ->
        IO.puts("amount")
        IO.inspect(amount)
        amount
      _ ->
        IO.puts("no amount")
        0
    end
  end

  def update_user_supporter_level(conn, supporter_level) do

    # Update user
    user_id = conn.assigns.current_user.id
    IO.puts("----------------------------- patreon callback 4")
    IO.inspect(user_id)

    user = Repo.get!(User, user_id)
    updates = %{
      supporter_level: supporter_level
    }
    user = Ecto.Changeset.change(user, updates)
    case Repo.update(user) do
      {:ok, _struct}       -> # Updated with success
        Pow.Plug.update_user(conn, %{}) # Refresh the session
        conn
        |> json(%{success: %{message: "Linked Patreon account", supporter_level: supporter_level}})
      {:error, _changeset} -> # Something went wrong
        conn
        |> json(%{error: %{message: "Failed to link Patreon account"}})
    end
  end

end
