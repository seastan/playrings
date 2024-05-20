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
    client_state = client_state(socket)
    if state["sockets"] != nil do
      broadcast!(socket, "users_changed", state["sockets"])
    end
    if client_state != nil do
      push(socket, "current_state", client_state(socket))
    end

    {:noreply, socket}
  end

  def handle_in("request_state", _payload, %{assigns: %{room_slug: room_slug}} = socket) do
    client_state = client_state(socket)
    push(socket, "current_state", client_state)
    {:reply, {:ok, "request_state"}, socket}
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

    old_state = GameUIServer.state(room_slug)
    old_replay_step = old_state["replayStep"]
    GameUIServer.game_action(room_slug, user_id, action, options)
    new_state = GameUIServer.state(room_slug)
    new_replay_step = new_state["replayStep"]
    messages = new_state["logMessages"]
    delta = Enum.at(new_state["deltas"], 0)

    # If round changed, save replay
    if get_in(new_state, ["game", "roundNumber"]) != get_in(old_state, ["game", "roundNumber"]) do
      GameUI.save_replay(new_state, user_id, options)
    end
    IO.puts("messages 1")
    IO.inspect(messages)

    notify_update(socket, room_slug, user_id, old_replay_step, new_replay_step, messages, delta)

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
    old_replay_step = old_state["replayStep"]
    old_game = old_state["game"]
    GameUIServer.step_through(room_slug, options)
    new_state = GameUIServer.state(room_slug)
    new_replay_step = new_state["replayStep"]
    new_game = new_state["game"]
    delta = GameUI.get_delta(old_game, new_game)
    messages = new_state["logMessages"]

    notify_update(socket, room_slug, user_id, old_replay_step, new_replay_step, messages, delta)

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

    old_state = GameUIServer.state(room_slug)
    old_replay_step = old_state["replayStep"]
    old_game = old_state["game"]
    GameUIServer.set_seat(room_slug, user_id, player_i, new_user_id)
    new_state = GameUIServer.state(room_slug)
    new_replay_step = new_state["replayStep"]
    new_game = new_state["game"]
    delta = GameUI.get_delta(old_game, new_game)
    messages = new_state["logMessages"]


    if new_state["playerInfo"] != nil do
      broadcast!(socket, "seats_changed", new_state["playerInfo"])
    end

    notify_update(socket, room_slug, user_id, old_replay_step, new_replay_step, messages, delta)

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

  defp notify_update(socket, room_slug, user_id, old_replay_step, new_replay_step, messages, delta) do

    payload = %{
      "oldReplayStep" => old_replay_step,
      "newReplayStep" => new_replay_step,
      "delta" => delta,
      "messages" => Enum.map(messages, fn(message_text) ->
        ChatMessage.new(message_text, -1)
      end)
    }
    broadcast!(socket, "send_update", payload)

    {:noreply, socket}
  end

  defp notify_state(socket, room_slug, user_id) do

    triggered_by = user_id
    broadcast!(socket, "send_state", triggered_by)

    {:noreply, socket}
  end

  # Define the handle_out function for the intercepted event
  def handle_out("send_state", triggered_by, socket) do
    new_client_state = client_state(socket)
    if new_client_state != nil do
      push(socket, "current_state", new_client_state)
    end
    {:noreply, socket}
  end

  # Define the handle_out function for the intercepted event
  def handle_out("send_update", payload, socket) do
    new_client_update = client_update(payload, socket.assigns)
    if new_client_update != nil do
      push(socket, "state_update", new_client_update)
    end
    {:noreply, socket}
  end

  defp client_update(payload, assigns) do
    gameui = GameUIServer.state(assigns[:room_slug])
    player_n = GameUI.get_player_n_by_user_id(gameui, assigns[:user_id])

    payload
    |> Map.put("player_n", player_n)

  end

  # This is what part of the state gets sent to the client.
  # It can be used to transform or hide it before they get it.
  defp client_state(socket) do
    GameUIServer.state(socket.assigns[:room_slug])
  end
end
