defmodule SpadesWeb.RoomChannel do
  @moduledoc """
  This channel will handle individual game rooms.
  """
  use SpadesWeb, :channel
  alias SpadesGame.{Card, GameUIServer, GameUIView}

  require Logger

  def join("room:" <> room_slug, _payload, socket) do
    # if authorized?(payload) do
    state = GameUIServer.state(room_slug)

    socket =
      socket
      |> assign(:room_slug, room_slug)
      |> assign(:game_ui, state)

    # {:ok, socket}
    {:ok, client_state(socket), socket}
    # else
    #   {:error, %{reason: "unauthorized"}}
    # end
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
    # payload |> IO.inspect()
    # Can also send back "{:reply, :ok, socket}" or send back "{:noreply, socket}"
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    {:reply, {:ok, client_state(socket)}, socket}
  end

  def handle_in(
        "sit",
        %{"whichSeat" => which_seat},
        %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
      ) do
    GameUIServer.sit(room_slug, user_id, which_seat)
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    notify(socket)
    {:reply, {:ok, client_state(socket)}, socket}
  end

  def handle_in(
        "bid",
        %{"bidNum" => bid_num},
        %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
      ) do
    GameUIServer.bid(room_slug, user_id, bid_num)
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    notify(socket)

    {:reply, {:ok, client_state(socket)}, socket}
  end

  def handle_in(
        "play",
        %{"card" => card},
        %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
      ) do
    card = Card.from_map(card)
    # Ignoring return value; could work on passing an error up
    GameUIServer.play(room_slug, user_id, card)
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    notify(socket)

    {:reply, {:ok, client_state(socket)}, socket}
  end

  def handle_in(
      "drag_cards",
      %{
        "source_group_id" => source_group_id,
        "source_indices" => source_indices,
        "dest_group_id" => dest_group_id,
        "dest_index" => dest_index,
        "drag_x" => drag_x,
        "drag_y" => drag_y
      },
      %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
    ) do
    # Ignoring return value; could work on passing an error up
    IO.puts("room channel: drag_cards a")
    #IO.puts(list_of_cards[0])
    GameUIServer.drag_cards(room_slug, user_id, source_group_id, source_indices, dest_group_id, dest_index, drag_x, drag_y)
    IO.puts("room channel: drag_cards b")
    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    notify(socket)

    {:reply, {:ok, client_state(socket)}, socket}
end

def handle_in(
  "update_groups",
  %{
    "groups" => groups
  },
  %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
) do
# Ignoring return value; could work on passing an error up
IO.puts("room channel: update_groups a")
IO.inspect(groups)
#IO.puts(list_of_cards[0])
GameUIServer.update_groups(room_slug, user_id, groups)
IO.puts("room channel: update_groups b")
state = GameUIServer.state(room_slug)
socket = socket |> assign(:game_ui, state)
notify(socket)

{:reply, {:ok, client_state(socket)}, socket}
end

  def handle_in(
        "invite_bots",
        _params,
        %{assigns: %{room_slug: room_slug, user_id: _user_id}} = socket
      ) do
    GameUIServer.invite_bots(room_slug)

    state = GameUIServer.state(room_slug)
    socket = socket |> assign(:game_ui, state)
    notify(socket)

    {:reply, {:ok, client_state(socket)}, socket}
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
    payload = %{}
    SpadesWeb.Endpoint.broadcast!("room:" <> room_slug, "ask_for_update", payload)
  end

  def terminate({:shutdown, :left}, socket) do
    on_terminate(socket)
  end

  def terminate({:shutdown, :closed}, socket) do
    on_terminate(socket)
  end

  defp on_terminate(%{assigns: %{room_slug: room_slug, user_id: user_id}} = socket) do
    state = GameUIServer.leave(room_slug, user_id)
    socket = socket |> assign(:game_ui, state)
    notify(socket)
  end

  defp notify(socket) do
    # # Fake a phx_reply event to everyone
    # payload = %{
    #   response: client_state(socket),
    #   status: "ok"
    # }

    # broadcast!(socket, "phx_reply", payload)
    broadcast!(socket, "ask_for_update", %{})
  end

  # Add authorization logic here as required.
  # defp authorized?(_payload) do
  #   true
  # end

  # This is what part of the state gets sent to the client.
  # It can be used to transform or hide it before they get it.
  #
  # Here, we are using GameUIView to hide the other player's hands.
  defp client_state(socket) do
    user_id = Map.get(socket.assigns, :user_id) || 0

    if Map.has_key?(socket.assigns, :game_ui) do
      socket.assigns
      |> Map.put(
        :game_ui_view,
        GameUIView.view_for(socket.assigns.game_ui, user_id)
      )
      |> Map.delete(:game_ui)
    else
      socket.assigns
    end
  end
end
