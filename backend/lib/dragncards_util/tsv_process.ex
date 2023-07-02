
defmodule DragnCardsUtil.TsvProcess do
  def process_rows(game_def, rows) do

    header0 = List.first(rows)
    # trim off the \r and \n
    header0 = Enum.map(header0, fn x -> String.trim(x, "\r") |> String.trim("\n") end)

    Enum.each(["uuid", "name", "imageUrl", "cardBack", "type"], fn x ->
      unless Enum.member?(header0, x) do
        raise "Missing #{x} column"
      end
    end)

    # cut off the header row
    rows = Enum.slice(rows, 1..-1)

    {card_db, _} = Enum.reduce(rows, {%{}, ""}, fn(row, {db, double_sided_uuid}) ->
      # Trim off the \r and \n
      row = Enum.map(row, fn x -> String.trim(x, "\r") |> String.trim("\n") end)
      if double_sided_uuid != "" do
        face_b = make_face(header0, row)
        db = put_in(db, [double_sided_uuid, "B"], face_b)
        {db, ""}
      else
        face_a = make_face(header0, row)
        face_b = make_null_face(header0)
        face_b = Map.put(face_b, "name", face_a["cardBack"])
        db = Map.put(db, face_a["uuid"], %{"A" => face_a, "B" => face_b})
        if face_a["cardBack"] == "double_sided" do
          {db, face_a["uuid"]}
        else
          {db, ""}
        end
      end
    end)

    card_db

  end

  defp make_face(header0, row) do
    Enum.reduce(0..(length(header0) - 1), %{}, fn j, face_acc ->
      col_name = Enum.at(header0, j)
      Map.put(face_acc, col_name, Enum.at(row, j))
    end)
  end

  defp make_null_face(header0) do
    Enum.reduce(0..(length(header0) - 1), %{}, fn j, face_acc ->
      col_name = Enum.at(header0, j)
      Map.put(face_acc, col_name, nil)
    end)
  end

end
