defmodule DragnCardsWeb.RoomChannel do
  @moduledoc """
  This channel will handle individual game rooms.
  """
  use DragnCardsWeb, :channel
  alias DragnCardsGame.{Card, GameUIServer, GameUI}

  require Logger

  def join("room:" <> room_slug, _payload, %{assigns: %{user_id: user_id}} = socket) do
    # if authorized?(payload) do
    state = GameUIServer.state(room_slug)

    socket =
      socket
      |> assign(:room_slug, room_slug)
      |> assign(:game_ui, state)

    # {:ok, socket}
    send(self, :after_join)
    {:ok, client_state(socket, "join_room"), socket}
    # else
    #   {:error, %{reason: "unauthorized"}}
    # end
  end

  def handle_info(:after_join, %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket) do
    # state = GameUIServer.state(room_slug)
    if GameUIServer.game_exists?(room_slug) do
      state = GameUIServer.state(room_slug)

      GameUIServer.add_player_to_room(room_slug, user_id)
      state = GameUIServer.state(room_slug)
      socket = socket |> assign(:game_ui, state)

      notify(socket, user_id)
    end
    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("request_state", _payload, %{assigns: %{room_slug: room_slug}} = socket) do
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    {:reply, {:ok, client_state(socket, "request_state")}, socket}
  end

  def handle_in(
    "game_action",
    %{
      "action" => action,
      "options" => options,
      "timestamp" => timestamp,
    },
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.game_action(room_slug, user_id, action, options)
    state = GameUIServer.state(room_slug)
    state = put_in(state["submittedTimestamp"], timestamp)

    socket = socket |> assign(:game_ui, state)
    notify(socket, user_id)

    {:reply, {:ok, client_state(socket, "game_action")}, socket}
  end

  def handle_in(
    "set_seat",
    %{
      "player_i" => player_i,
      "new_user_id" => new_user_id,
      "timestamp" => timestamp,
    },
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.set_seat(room_slug, user_id, player_i, new_user_id)
    state = GameUIServer.state(room_slug)

    socket = socket |> assign(:game_ui, state)
    notify(socket, user_id)

    {:reply, {:ok, client_state(socket, "set_seat")}, socket}
  end

  def handle_in(
    "close_room",
    %{},
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.close_room(room_slug, user_id)
    state = GameUIServer.state(room_slug)

    socket = socket |> assign(:game_ui, state)
    notify(socket, user_id)

    {:reply, {:ok, client_state(socket,"close_room")}, socket}
  end

  @doc """
  notify_from_outside/1: Tell everyone in the channel to send a message
  asking for a state update.
  This used to broadcast game state to everyone, but game state can contain
  private information.  So we tell everyone to ask for an update instead. Since
  we're over a websocket, the extra cost shouldn't be that bad.
  SERVER: "ask_for_update", %{}
  CLIENT: "request_state", %{}
  SERVER: "phx_reply", %{personalized state}

  Note 1: After making this, I found a Phoenix Channel mechanism that lets
  you intercept and change outgoing messages.  That might be better.
  Note 2: "Outside" here means a caller from anywhere in the system can call
  this, unlike "notify".
  """
  def notify_from_outside(room_slug) do
    payload = %{user_id: 0}
    DragnCardsWeb.Endpoint.broadcast!("room:" <> room_slug, "ask_for_update", payload)
  end

  def terminate({:normal, _payload}, socket) do
    # Closed normally. Do nothing.
    {:ok}
  end

  def terminate({:shutdown, :left}, socket) do
    on_terminate(socket)
  end

  def terminate({:shutdown, :closed}, socket) do
    on_terminate(socket)
  end

  def terminate(_reason, socket) do
    on_terminate(socket)
  end

  defp on_terminate(%{assigns: %{room_slug: room_slug, user_id: user_id}} = socket) do
    state = GameUIServer.leave(room_slug, user_id)
    socket = socket |> assign(:game_ui, state)
    notify(socket, user_id)
  end

  defp notify(socket, user_id) do
    # # Fake a phx_reply event to everyone
    payload = %{
      response: %{user_id: user_id},
      status: "ok"
    }

    # broadcast!(socket, "phx_reply", payload)
    broadcast!(socket, "ask_for_update", payload)
  end

  # Remove deltas from a gameui, as it's not needed for rendering
  def remove_deltas(gameui) do
    gameui = if gameui do
      put_in(gameui["game"]["deltas"], [])
    else
      gameui
    end
  end

  def reduce_size(gameui, just_joined) do
    gameui = if just_joined || gameui["game"]["last_action"] == "load_cards" do
      gameui
    else
      Enum.reduce(gameui["game"]["cardById"], gameui, fn({card_id, card}, acc) ->
        put_in(acc["game"]["cardById"][card_id]["sides"], nil)
      end)
    end
  end

  # This is what part of the state gets sent to the client.
  # It can be used to transform or hide it before they get it.
  defp client_state(socket, type \\ "") do
    if Map.has_key?(socket.assigns, :game_ui) do
      gameui = socket.assigns.game_ui
      if type == "game_action" do
        last_delta = Enum.at(gameui["game"]["deltas"],0)
        socket.assigns |> Map.put(:last_delta,last_delta)
      else
        gameui = remove_deltas(gameui)
        socket.assigns |> Map.put(:game_ui,gameui)
      end
    else
      socket.assigns
    end
  end
end
