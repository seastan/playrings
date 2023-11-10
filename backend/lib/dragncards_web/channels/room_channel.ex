defmodule DragnCardsWeb.RoomChannel do
  @moduledoc """
  This channel will handle individual game rooms.
  """
  use DragnCardsWeb, :channel
  alias DragnCardsGame.{GameUIServer, GameUI}
  alias DragnCardsChat.{ChatMessage}
  intercept ["send_update", "send_state"]

  require Logger


  def join("room:" <> room_slug, _payload, %{assigns: %{user_id: _user_id}} = socket) do

    socket =
      socket
      |> assign(:room_slug, room_slug)


    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, %{assigns: %{room_slug: room_slug, user_id: user_id}, channel_pid: pid} = socket) do
    # state = GameUIServer.state(room_slug)
    GameUIServer.add_player_to_room(room_slug, user_id, pid)
    state = GameUIServer.state(room_slug)
    if state["sockets"] != nil do
      broadcast!(socket, "users_changed", state["sockets"])
    end
    push(socket, "current_state", client_state(socket, state))
    {:noreply, socket}
  end

  def handle_in("request_state", _payload, %{assigns: %{room_slug: room_slug}} = socket) do
    state = GameUIServer.state(room_slug)
    {:reply, {:ok, client_state(socket, state)}, socket}
  end

  def handle_in(
    "game_action",
    %{
      "action" => action,
      "options" => options,
      "timestamp" => _timestamp,
    },
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.game_action(room_slug, user_id, action, options)

    notify_update(socket, room_slug, user_id)

    {:reply, {:ok, "game_action"}, socket}
  end

  def handle_in(
    "step_through",
    %{
      "options" => options,
    },
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    old_state = GameUIServer.state(room_slug)
    old_game = old_state["game"]
    GameUIServer.step_through(room_slug, options)
    new_state = GameUIServer.state(room_slug)
    new_game = new_state["game"]
    delta = GameUI.get_delta(old_game, new_game)


    notify_state(socket, room_slug, user_id)

    {:reply, {:ok, "game_action"}, socket}
  end

  def handle_in(
    "set_seat",
    %{
      "player_i" => player_i,
      "new_user_id" => new_user_id,
      "timestamp" => _timestamp,
    },
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.set_seat(room_slug, user_id, player_i, new_user_id)

    state = GameUIServer.state(room_slug)
    if state["playerInfo"] != nil do
      broadcast!(socket, "seats_changed", state["playerInfo"])
    end

    {:reply, :ok, socket}
  end

  def handle_in(
    "close_room",
    %{},
    %{assigns: %{room_slug: room_slug, user_id: user_id}} = socket
  ) do
    GameUIServer.close_room(room_slug, user_id)

    notify_state(socket, room_slug, user_id)

    {:reply, :ok, socket}
  end

  def terminate({:normal, _payload}, _socket) do
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

  defp on_terminate(%{assigns: %{room_slug: room_slug, user_id: user_id}, channel_pid: _pid} = socket) do
    state = GameUIServer.state(room_slug)
    if state["sockets"] != nil do
      broadcast!(socket, "users_changed", state["sockets"])
    end
  end

  defp notify_update(socket, room_slug, user_id) do

    triggered_by = user_id
    broadcast!(socket, "send_update", triggered_by)

    {:noreply, socket}
  end

  defp notify_state(socket, room_slug, user_id) do

    triggered_by = user_id
    broadcast!(socket, "send_state", triggered_by)

    {:noreply, socket}
  end

  # Define the handle_out function for the intercepted event
  def handle_out("send_state", triggered_by, socket) do
    push(socket, "current_state", client_state(socket, socket.assigns))
    {:noreply, socket}
  end

  # Define the handle_out function for the intercepted event
  def handle_out("send_update", triggered_by, socket) do
    push(socket, "state_update", client_update(triggered_by, socket.assigns))
    {:noreply, socket}
  end

  defp client_update(triggered_by, assigns) do
    gameui = GameUIServer.state(assigns[:room_slug])

    player_n = GameUI.get_player_n_by_user_id(gameui, assigns[:user_id])
    delta = Enum.at(gameui["deltas"], 0)

    log_messages = if gameui["logMessages"] == nil do
      []
    else
      gameui["logMessages"]
    end

    messages = Enum.map(log_messages, fn(message_text) ->
      ChatMessage.new(message_text, -1)
    end)

    %{
      "player_n" => player_n,
      "delta" => delta,
      "replayStep" => gameui["replayStep"],
      "messages" => messages
    }
  end

  # This is what part of the state gets sent to the client.
  # It can be used to transform or hide it before they get it.
  defp client_state(_socket, state) do
    state
  end
end
