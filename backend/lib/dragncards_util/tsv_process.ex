
defmodule DragnCardsUtil.TsvProcess do
  def process_rows(game_def, rows) do

    header0 = List.first(rows)

    Enum.each(["uuid", "name", "imageUrl", "cardBack", "type"], fn x ->
      unless Enum.member?(header0, x) do
        raise "Missing #{x} column"
      end
    end)

    # cut off the header row
    rows = Enum.slice(rows, 1..-1)

    {card_db, _} = Enum.reduce(rows, {%{}, false}, fn(row, {db, skip_row}) ->
      if skip_row do
        face_b = make_face(header0, row)
        db = put_in(db, [face_b["uuid"], "B"], face_b)
        {db, false}
      else
        face_a = make_face(header0, row)
        face_b = make_null_face(header0)
        face_b = Map.put(face_b, "name", face_a["cardBack"])
        db = Map.put(db, face_a["uuid"], %{"A" => face_a, "B" => face_b})
        if face_a["cardBack"] == "double_sided" do
          {db, true}
        else
          {db, false}
        end
      end
    end)

    card_db

  end

  defp make_face(header0, row) do
    Enum.reduce(0..(length(header0) - 1), %{}, fn j, face_acc ->
      col_name = String.trim(Enum.at(header0, j), "\r") |> String.trim("\n")
      Map.put(face_acc, col_name, String.trim(Enum.at(row, j), "\r") |> String.trim("\n"))
    end)
  end

  defp make_null_face(header0) do
    Enum.reduce(0..(length(header0) - 1), %{}, fn j, face_acc ->
      col_name = String.trim(Enum.at(header0, j), "\r") |> String.trim("\n")
      Map.put(face_acc, col_name, nil)
    end)
  end

end
