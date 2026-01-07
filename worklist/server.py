import os
import logging
import psycopg2
from pynetdicom import AE, evt, debug_logger
from pynetdicom.sop_class import ModalityWorklistInformationFind
from pydicom.dataset import Dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worklist")

DB_HOST = os.getenv("DB_HOST", "proclinic-db")
DB_NAME = os.getenv("DB_NAME", "proclinic_db")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "senha_segura_123")

def get_db_connection():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)

def handle_find(event):
    ds = event.identifier
    calling_aet = event.assoc.requestor.ae_title.strip()
    logger.info(f"--- Nova Consulta de: {calling_aet} ---")

    filtros_sql = ["a.\"Status\" = 'Confirmado'", "DATE(a.\"DataHoraInicio\") = CURRENT_DATE"]
    params_sql = []
    
    # 1. Filtros DICOM (Se o equipamento pedir)
    if 'ScheduledProcedureStepSequence' in ds:
        seq_item = ds.ScheduledProcedureStepSequence[0]
        
        # Filtro por Modalidade
        if 'Modality' in seq_item and seq_item.Modality:
            modality_req = seq_item.Modality.strip()
            if modality_req:
                logger.info(f"Filtro solicitado: MODALIDADE = {modality_req}")
                # A query agora verifica se a modalidade do SERVIÇO bate, ou se a do EQUIPAMENTO bate
                filtros_sql.append('(s."Modalidade" = %s OR e."Modalidade" = %s)')
                params_sql.append(modality_req)
                params_sql.append(modality_req)

        # Filtro por AE Title
        if 'ScheduledStationAETitle' in seq_item and seq_item.ScheduledStationAETitle:
            aet_req = seq_item.ScheduledStationAETitle.strip()
            if aet_req:
                logger.info(f"Filtro solicitado: STATION AET = {aet_req}")
                filtros_sql.append('e."AETitle" = %s')
                params_sql.append(aet_req)

    # 2. Se não pediu filtro, filtra pelo AE Title da conexão (Segurança básica)
    if len(params_sql) == 0:
        logger.info(f"Usando filtro padrão Calling AET: {calling_aet}")
        filtros_sql.append('e."AETitle" = %s')
        params_sql.append(calling_aet)

    responses = []
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        where_clause = " AND ".join(filtros_sql)
        
        # --- QUERY AVANÇADA ---
        # COALESCE(s."Modalidade", e."Modalidade"): Se o exame tiver modalidade, usa. Se não, usa a da sala.
        query = f"""
            SELECT 
                p."Nome", p."CPF", p."DataNascimento", p."Sexo",
                a."OrdemServico", a."DataHoraInicio", 
                s."Nome",
                COALESCE(s."Modalidade", e."Modalidade") as ModalityFinal
            FROM "Agendamentos" a
            JOIN "Pacientes" p ON a."CpfPaciente" = p."CPF"
            JOIN "Agendas" ac ON a."AgendaConfigId" = ac."Id"
            JOIN "Equipamentos" e ON ac."EquipamentoId" = e."Id"
            LEFT JOIN "Servicos" s ON a."ServicoId" = s."Id"
            WHERE {where_clause}
        """
        
        cur.execute(query, tuple(params_sql))
        rows = cur.fetchall()

        for row in rows:
            nome, cpf, nasc, sexo, accession, datahora, exame, modalidade = row
            
            resp = Dataset()
            resp.PatientName = nome
            resp.PatientID = cpf
            resp.AccessionNumber = accession
            resp.PatientBirthDate = nasc.strftime('%Y%m%d') if nasc else ''
            resp.PatientSex = sexo if sexo else 'O'

            step = Dataset()
            step.ScheduledStationAETitle = calling_aet
            step.ScheduledProcedureStepStartDate = datahora.strftime('%Y%m%d')
            step.ScheduledProcedureStepStartTime = datahora.strftime('%H%M%S')
            step.Modality = modalidade # Aqui vai a modalidade certa (do exame ou sala)
            step.ScheduledProcedureStepDescription = exame
            step.ScheduledProcedureStepID = accession
            
            resp.ScheduledProcedureStepSequence = [step]
            responses.append(resp)

        cur.close()
        conn.close()

    except Exception as e:
        logger.error(f"Erro no banco: {e}")
        return []

    for resp in responses:
        yield (0xFF00, resp)

ae = AE(ae_title=b"PROWORKLIST")
ae.add_supported_context(ModalityWorklistInformationFind)
ae.require_called_aet = False 

logger.info("Servidor Worklist V2 (Com Modalidade) rodando na porta 11112...")
ae.start_server(("0.0.0.0", 11112), evt_handlers=[(evt.EVT_C_FIND, handle_find)])