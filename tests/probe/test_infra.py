# pytest rechazado: el repositorio prueba con unittest y no usa pytest.
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from orchestrator.engine import DEFAULT_MAX_SLOTS, MASTER_NAME, OrchestratorError, forbid


class InfraProbeTest(unittest.TestCase):
    def test_default_max_slots_is_none(self):
        # Arrange: el paquete publica el cupo por defecto.
        # Act
        slots = DEFAULT_MAX_SLOTS
        # Assert
        self.assertIsNone(slots)

    def test_forbid_push_force_raises_orchestrator_error(self):
        # Arrange
        args = ["push", "--force"]
        # Act / Assert
        with self.assertRaises(OrchestratorError):
            forbid(args)

    def test_forbid_reset_hard_raises_orchestrator_error(self):
        # Arrange
        args = ["reset", "--hard"]
        # Act / Assert
        with self.assertRaises(OrchestratorError):
            forbid(args)

    def test_orchestrator_contract_and_integration_doc_exist(self):
        # Arrange
        contract = ROOT / "ORCHESTRATOR.md"
        integration = ROOT / "docs" / "orchestrator" / "04-integracion.md"
        # Act
        contract_exists = contract.is_file()
        integration_exists = integration.is_file()
        # Assert
        self.assertTrue(contract_exists)
        self.assertTrue(integration_exists)

    def test_master_prompt_financial_operations_is_absent(self):
        # Arrange
        master = ROOT / MASTER_NAME
        # Act
        present = master.exists()
        # Assert
        self.assertEqual(MASTER_NAME, "MASTER_PROMPT_FINANCIAL_OPERATIONS.md")
        self.assertFalse(present)


if __name__ == "__main__":
    unittest.main()
