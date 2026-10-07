from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
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
        return {"error": "File not found"}

    df = data_store[file_id]

    if x_col not in df.columns or y_col not in df.columns:
        return {"error": "Column not found"}

    aggregated = df.groupby(x_col)[y_col].sum().reset_index().head(20)

    chart_data = aggregated.to_dict(orient="records")

    return {"data": chart_data}

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
