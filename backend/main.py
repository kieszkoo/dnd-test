import base64

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use("agg")
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

data_store ={}

@app.post('/upload-csv')
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()

    df = pd.read_csv(io.BytesIO(contents))

    file_id = file.filename
    data_store[file_id] = df

    return {
        'status': 'success',
        'file_id': file_id,
        'columns': df.columns.to_list(),
        'rows_count': len(df)
    }

@app.get("/plot/bar")
def get_plot_bar(file_id: str, x_col: str, y_col: str):
    if file_id not in data_store:
        return {"error":"File not found"}
    df = data_store[file_id]
    if x_col not in df.columns or y_col not in df.columns:
        return {"error":"Column not found"}

    try:
        temp_df = df.copy()
        temp_df[y_col] = pd.to_numeric(temp_df[y_col], errors="coerce")
        aggregated = temp_df.groupby(x_col)[y_col].sum().reset_index()

        plt.figure(figsize = (6,4))
        plt.bar(aggregated[x_col].astype(str), aggregated[y_col], color="#a855f7")
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        plt.title(f"{y_col} wg {x_col}")
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=100)
        plt.close()

        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode("utf-8")

        return {"image": image_base64}
    except Exception as e:
        plt.close()
        return {"error": f"Błąd generowania wykresu: {str(e)}"}

@app.get("/plot/line")
def get_plot_line(file_id: str, x_col: str, y_col: str):
    if file_id not in data_store:
        return {"error": "File not found"}
    df = data_store[file_id]
    if x_col not in df.columns or y_col not in df.columns:
        return {"error": "Column not found"}

    try:
        temp_df = df.copy()
        temp_df[y_col] = pd.to_numeric(temp_df[y_col], errors="coerce")
        aggregated = temp_df.groupby(x_col)[y_col].sum().reset_index()

        plt.figure(figsize=(6, 4))
        plt.plot(aggregated[x_col].astype(str), aggregated[y_col], marker="o", color="#2563eb", linewidth=2, markersize=5)
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        plt.title(f"{y_col} wg {x_col}")
        plt.xticks(rotation=45, ha="right")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=100)
        plt.close()

        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode("utf-8")

        return {"image": image_base64}
    except Exception as e:
        plt.close()
        return {"error": f"Błąd generowania wykresu: {str(e)}"}

@app.get("/data/view")
def view_data(file_id: str, limit: int = 50):
    if file_id not in data_store:
        return {"error": "File not found"}

    df = data_store[file_id]
    data_subset = df.head(limit)
    data_subset = data_subset.where(pd.notnull(data_subset), None)
    return {
        "columns": df.columns.to_list(),
        "data": data_subset.to_dict(orient="records")
    }
