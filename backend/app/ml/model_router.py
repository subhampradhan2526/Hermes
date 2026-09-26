from typing import Dict, Optional
from app.core.config import settings
from app.ml.model_adapter import ModelAdapter
from app.ml.existing_pipeline import ExistingPipelineAdapter
from app.ml.custom_model_adapter import CustomModelAdapter


class ModelRouter:
    """
    Model Router layer that dynamically selects between the existing
    Football CV pipeline and user-provided custom ML models.
    """

    def __init__(self):
        self._adapters: Dict[str, ModelAdapter] = {}
        # Lazy initialization
        self._default_model = settings.DEFAULT_MODEL

    def get_adapter(self, model_name: Optional[str] = None) -> ModelAdapter:
        name = model_name or self._default_model
        if name not in self._adapters:
            if name == "custom_model":
                adapter = CustomModelAdapter()
                adapter.initialize()
                self._adapters[name] = adapter
            else:
                # Default to existing football CV pipeline
                adapter = ExistingPipelineAdapter()
                self._adapters[name] = adapter

        return self._adapters[name]

    def register_adapter(self, name: str, adapter: ModelAdapter) -> None:
        self._adapters[name] = adapter


model_router = ModelRouter()
