-- ============================================================
-- SEED CORREGIDO: Mundial 2026
-- Fuente: fixture oficial FIFA (worldcupwiki.com, mayo 2026)
-- Horarios en UTC-5 (hora Colombia / ET - 1h)
-- Ejecutar en orden: 1) equipos → 2) partidos grupos → 3) eliminatorias
-- ============================================================

-- ============================================================
-- 1. EQUIPOS (48 selecciones — grupos confirmados)
-- ============================================================

INSERT INTO public.equipos (nombre, codigo, grupo) VALUES
-- Grupo A
('México',          'MEX', 'A'),
('Sudáfrica',       'RSA', 'A'),
('Corea del Sur',   'KOR', 'A'),
('República Checa', 'CZE', 'A'),
-- Grupo B
('Canadá',               'CAN', 'B'),
('Bosnia y Herzegovina', 'BIH', 'B'),
('Catar',                'QAT', 'B'),
('Suiza',                'SUI', 'B'),
-- Grupo C
('Brasil',    'BRA', 'C'),
('Marruecos', 'MAR', 'C'),
('Haití',     'HAI', 'C'),
('Escocia',   'SCO', 'C'),
-- Grupo D
('Estados Unidos', 'USA', 'D'),
('Paraguay',       'PAR', 'D'),
('Australia',      'AUS', 'D'),
('Turquía',        'TUR', 'D'),
-- Grupo E
('Alemania',        'GER', 'E'),
('Curazao',         'CUW', 'E'),
('Costa de Marfil', 'CIV', 'E'),
('Ecuador',         'ECU', 'E'),
-- Grupo F
('Países Bajos', 'NED', 'F'),
('Japón',        'JPN', 'F'),
('Suecia',       'SWE', 'F'),
('Túnez',        'TUN', 'F'),
-- Grupo G
('Bélgica',       'BEL', 'G'),
('Egipto',        'EGY', 'G'),
('Irán',          'IRN', 'G'),
('Nueva Zelanda', 'NZL', 'G'),
-- Grupo H
('España',         'ESP', 'H'),
('Cabo Verde',     'CPV', 'H'),
('Arabia Saudita', 'KSA', 'H'),
('Uruguay',        'URU', 'H'),
-- Grupo I
('Francia',  'FRA', 'I'),
('Senegal',  'SEN', 'I'),
('Irak',     'IRQ', 'I'),
('Noruega',  'NOR', 'I'),
-- Grupo J
('Argentina', 'ARG', 'J'),
('Argelia',   'ALG', 'J'),
('Austria',   'AUT', 'J'),
('Jordania',  'JOR', 'J'),
-- Grupo K
('Portugal',   'POR', 'K'),
('Uzbekistán', 'UZB', 'K'),
('Colombia',   'COL', 'K'),
('Congo',      'COD', 'K'),
-- Grupo L
('Inglaterra', 'ENG', 'L'),
('Croacia',    'CRO', 'L'),
('Ghana',      'GHA', 'L'),
('Panamá',     'PAN', 'L');


-- ============================================================
-- 2. PARTIDOS FASE DE GRUPOS (72 partidos exactos)
-- Conversión ET → Colombia (UTC-5): ET = Colombia (misma zona)
-- ============================================================

INSERT INTO public.partidos (fase, grupo, equipo_local_id, equipo_visitante_id, fecha_hora, estadio, ciudad) VALUES

-- ── JORNADA 1 ──────────────────────────────────────────────

-- Jueves 11 jun
('grupos','A',(SELECT id FROM equipos WHERE codigo='MEX'),(SELECT id FROM equipos WHERE codigo='RSA'),'2026-06-11 15:00:00-05','Estadio Azteca','Ciudad de México'),
('grupos','A',(SELECT id FROM equipos WHERE codigo='KOR'),(SELECT id FROM equipos WHERE codigo='CZE'),'2026-06-11 22:00:00-05','Estadio Akron','Zapopan'),

-- Viernes 12 jun
('grupos','B',(SELECT id FROM equipos WHERE codigo='CAN'),(SELECT id FROM equipos WHERE codigo='BIH'),'2026-06-12 15:00:00-05','BMO Field','Toronto'),
('grupos','D',(SELECT id FROM equipos WHERE codigo='USA'),(SELECT id FROM equipos WHERE codigo='PAR'),'2026-06-12 21:00:00-05','SoFi Stadium','Los Ángeles'),

-- Sábado 13 jun
('grupos','B',(SELECT id FROM equipos WHERE codigo='QAT'),(SELECT id FROM equipos WHERE codigo='SUI'),'2026-06-13 15:00:00-05','Levi''s Stadium','San Francisco'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='BRA'),(SELECT id FROM equipos WHERE codigo='MAR'),'2026-06-13 18:00:00-05','MetLife Stadium','Nueva York'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='HAI'),(SELECT id FROM equipos WHERE codigo='SCO'),'2026-06-13 21:00:00-05','Gillette Stadium','Boston'),

-- Domingo 14 jun
('grupos','D',(SELECT id FROM equipos WHERE codigo='AUS'),(SELECT id FROM equipos WHERE codigo='TUR'),'2026-06-14 00:00:00-05','BC Place','Vancouver'),
('grupos','E',(SELECT id FROM equipos WHERE codigo='GER'),(SELECT id FROM equipos WHERE codigo='CUW'),'2026-06-14 13:00:00-05','NRG Stadium','Houston'),
('grupos','F',(SELECT id FROM equipos WHERE codigo='NED'),(SELECT id FROM equipos WHERE codigo='JPN'),'2026-06-14 16:00:00-05','AT&T Stadium','Dallas'),
('grupos','E',(SELECT id FROM equipos WHERE codigo='CIV'),(SELECT id FROM equipos WHERE codigo='ECU'),'2026-06-14 19:00:00-05','Lincoln Financial Field','Filadelfia'),
('grupos','F',(SELECT id FROM equipos WHERE codigo='SWE'),(SELECT id FROM equipos WHERE codigo='TUN'),'2026-06-14 22:00:00-05','Estadio BBVA','Monterrey'),

-- Lunes 15 jun
('grupos','H',(SELECT id FROM equipos WHERE codigo='ESP'),(SELECT id FROM equipos WHERE codigo='CPV'),'2026-06-15 12:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='BEL'),(SELECT id FROM equipos WHERE codigo='EGY'),'2026-06-15 15:00:00-05','Lumen Field','Seattle'),
('grupos','H',(SELECT id FROM equipos WHERE codigo='KSA'),(SELECT id FROM equipos WHERE codigo='URU'),'2026-06-15 18:00:00-05','Hard Rock Stadium','Miami'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='IRN'),(SELECT id FROM equipos WHERE codigo='NZL'),'2026-06-15 21:00:00-05','SoFi Stadium','Los Ángeles'),

-- Martes 16 jun
('grupos','I',(SELECT id FROM equipos WHERE codigo='FRA'),(SELECT id FROM equipos WHERE codigo='SEN'),'2026-06-16 15:00:00-05','MetLife Stadium','Nueva York'),
('grupos','I',(SELECT id FROM equipos WHERE codigo='IRQ'),(SELECT id FROM equipos WHERE codigo='NOR'),'2026-06-16 18:00:00-05','Gillette Stadium','Boston'),
('grupos','J',(SELECT id FROM equipos WHERE codigo='ARG'),(SELECT id FROM equipos WHERE codigo='ALG'),'2026-06-16 21:00:00-05','Arrowhead Stadium','Kansas City'),

-- Miércoles 17 jun
('grupos','J',(SELECT id FROM equipos WHERE codigo='AUT'),(SELECT id FROM equipos WHERE codigo='JOR'),'2026-06-17 00:00:00-05','Levi''s Stadium','San Francisco'),
('grupos','K',(SELECT id FROM equipos WHERE codigo='POR'),(SELECT id FROM equipos WHERE codigo='COD'),'2026-06-17 13:00:00-05','NRG Stadium','Houston'),
('grupos','L',(SELECT id FROM equipos WHERE codigo='ENG'),(SELECT id FROM equipos WHERE codigo='CRO'),'2026-06-17 16:00:00-05','AT&T Stadium','Dallas'),
('grupos','L',(SELECT id FROM equipos WHERE codigo='GHA'),(SELECT id FROM equipos WHERE codigo='PAN'),'2026-06-17 19:00:00-05','BMO Field','Toronto'),
('grupos','K',(SELECT id FROM equipos WHERE codigo='UZB'),(SELECT id FROM equipos WHERE codigo='COL'),'2026-06-17 22:00:00-05','Estadio Azteca','Ciudad de México'),

-- ── JORNADA 2 ──────────────────────────────────────────────

-- Jueves 18 jun
('grupos','A',(SELECT id FROM equipos WHERE codigo='CZE'),(SELECT id FROM equipos WHERE codigo='RSA'),'2026-06-18 12:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('grupos','B',(SELECT id FROM equipos WHERE codigo='SUI'),(SELECT id FROM equipos WHERE codigo='BIH'),'2026-06-18 15:00:00-05','SoFi Stadium','Los Ángeles'),
('grupos','B',(SELECT id FROM equipos WHERE codigo='CAN'),(SELECT id FROM equipos WHERE codigo='QAT'),'2026-06-18 18:00:00-05','BC Place','Vancouver'),
('grupos','A',(SELECT id FROM equipos WHERE codigo='MEX'),(SELECT id FROM equipos WHERE codigo='KOR'),'2026-06-18 21:00:00-05','Estadio Akron','Zapopan'),

-- Viernes 19 jun
('grupos','D',(SELECT id FROM equipos WHERE codigo='USA'),(SELECT id FROM equipos WHERE codigo='AUS'),'2026-06-19 15:00:00-05','Lumen Field','Seattle'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='SCO'),(SELECT id FROM equipos WHERE codigo='MAR'),'2026-06-19 18:00:00-05','Gillette Stadium','Boston'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='BRA'),(SELECT id FROM equipos WHERE codigo='HAI'),'2026-06-19 20:30:00-05','Lincoln Financial Field','Filadelfia'),
('grupos','D',(SELECT id FROM equipos WHERE codigo='TUR'),(SELECT id FROM equipos WHERE codigo='PAR'),'2026-06-19 23:00:00-05','Levi''s Stadium','San Francisco'),

-- Sábado 20 jun
('grupos','F',(SELECT id FROM equipos WHERE codigo='NED'),(SELECT id FROM equipos WHERE codigo='SWE'),'2026-06-20 13:00:00-05','NRG Stadium','Houston'),
('grupos','E',(SELECT id FROM equipos WHERE codigo='GER'),(SELECT id FROM equipos WHERE codigo='CIV'),'2026-06-20 16:00:00-05','BMO Field','Toronto'),
('grupos','E',(SELECT id FROM equipos WHERE codigo='ECU'),(SELECT id FROM equipos WHERE codigo='CUW'),'2026-06-20 20:00:00-05','Arrowhead Stadium','Kansas City'),

-- Domingo 21 jun
('grupos','F',(SELECT id FROM equipos WHERE codigo='TUN'),(SELECT id FROM equipos WHERE codigo='JPN'),'2026-06-21 00:00:00-05','Estadio BBVA','Monterrey'),
('grupos','H',(SELECT id FROM equipos WHERE codigo='ESP'),(SELECT id FROM equipos WHERE codigo='KSA'),'2026-06-21 12:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='BEL'),(SELECT id FROM equipos WHERE codigo='IRN'),'2026-06-21 15:00:00-05','SoFi Stadium','Los Ángeles'),
('grupos','H',(SELECT id FROM equipos WHERE codigo='URU'),(SELECT id FROM equipos WHERE codigo='CPV'),'2026-06-21 18:00:00-05','Hard Rock Stadium','Miami'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='NZL'),(SELECT id FROM equipos WHERE codigo='EGY'),'2026-06-21 21:00:00-05','BC Place','Vancouver'),

-- Lunes 22 jun
('grupos','J',(SELECT id FROM equipos WHERE codigo='ARG'),(SELECT id FROM equipos WHERE codigo='AUT'),'2026-06-22 13:00:00-05','AT&T Stadium','Dallas'),
('grupos','I',(SELECT id FROM equipos WHERE codigo='FRA'),(SELECT id FROM equipos WHERE codigo='IRQ'),'2026-06-22 17:00:00-05','Lincoln Financial Field','Filadelfia'),
('grupos','I',(SELECT id FROM equipos WHERE codigo='NOR'),(SELECT id FROM equipos WHERE codigo='SEN'),'2026-06-22 20:00:00-05','MetLife Stadium','Nueva York'),
('grupos','J',(SELECT id FROM equipos WHERE codigo='JOR'),(SELECT id FROM equipos WHERE codigo='ALG'),'2026-06-22 23:00:00-05','Levi''s Stadium','San Francisco'),

-- Martes 23 jun
('grupos','K',(SELECT id FROM equipos WHERE codigo='POR'),(SELECT id FROM equipos WHERE codigo='UZB'),'2026-06-23 13:00:00-05','NRG Stadium','Houston'),
('grupos','L',(SELECT id FROM equipos WHERE codigo='ENG'),(SELECT id FROM equipos WHERE codigo='GHA'),'2026-06-23 16:00:00-05','Gillette Stadium','Boston'),
('grupos','L',(SELECT id FROM equipos WHERE codigo='PAN'),(SELECT id FROM equipos WHERE codigo='CRO'),'2026-06-23 19:00:00-05','BMO Field','Toronto'),
('grupos','K',(SELECT id FROM equipos WHERE codigo='COL'),(SELECT id FROM equipos WHERE codigo='COD'),'2026-06-23 22:00:00-05','Estadio Akron','Zapopan'),

-- ── JORNADA 3 (simultánea por grupo) ───────────────────────

-- Miércoles 24 jun
('grupos','B',(SELECT id FROM equipos WHERE codigo='SUI'),(SELECT id FROM equipos WHERE codigo='CAN'),'2026-06-24 15:00:00-05','BC Place','Vancouver'),
('grupos','B',(SELECT id FROM equipos WHERE codigo='BIH'),(SELECT id FROM equipos WHERE codigo='QAT'),'2026-06-24 15:00:00-05','Lumen Field','Seattle'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='SCO'),(SELECT id FROM equipos WHERE codigo='BRA'),'2026-06-24 18:00:00-05','Hard Rock Stadium','Miami'),
('grupos','C',(SELECT id FROM equipos WHERE codigo='MAR'),(SELECT id FROM equipos WHERE codigo='HAI'),'2026-06-24 18:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('grupos','A',(SELECT id FROM equipos WHERE codigo='CZE'),(SELECT id FROM equipos WHERE codigo='MEX'),'2026-06-24 21:00:00-05','Estadio Azteca','Ciudad de México'),
('grupos','A',(SELECT id FROM equipos WHERE codigo='RSA'),(SELECT id FROM equipos WHERE codigo='KOR'),'2026-06-24 21:00:00-05','Estadio BBVA','Monterrey'),

-- Jueves 25 jun
('grupos','E',(SELECT id FROM equipos WHERE codigo='CUW'),(SELECT id FROM equipos WHERE codigo='CIV'),'2026-06-25 16:00:00-05','Lincoln Financial Field','Filadelfia'),
('grupos','E',(SELECT id FROM equipos WHERE codigo='ECU'),(SELECT id FROM equipos WHERE codigo='GER'),'2026-06-25 16:00:00-05','MetLife Stadium','Nueva York'),
('grupos','F',(SELECT id FROM equipos WHERE codigo='JPN'),(SELECT id FROM equipos WHERE codigo='SWE'),'2026-06-25 19:00:00-05','AT&T Stadium','Dallas'),
('grupos','F',(SELECT id FROM equipos WHERE codigo='TUN'),(SELECT id FROM equipos WHERE codigo='NED'),'2026-06-25 19:00:00-05','Arrowhead Stadium','Kansas City'),
('grupos','D',(SELECT id FROM equipos WHERE codigo='TUR'),(SELECT id FROM equipos WHERE codigo='USA'),'2026-06-25 22:00:00-05','SoFi Stadium','Los Ángeles'),
('grupos','D',(SELECT id FROM equipos WHERE codigo='PAR'),(SELECT id FROM equipos WHERE codigo='AUS'),'2026-06-25 22:00:00-05','Levi''s Stadium','San Francisco'),

-- Viernes 26 jun
('grupos','I',(SELECT id FROM equipos WHERE codigo='NOR'),(SELECT id FROM equipos WHERE codigo='FRA'),'2026-06-26 15:00:00-05','Gillette Stadium','Boston'),
('grupos','I',(SELECT id FROM equipos WHERE codigo='SEN'),(SELECT id FROM equipos WHERE codigo='IRQ'),'2026-06-26 15:00:00-05','BMO Field','Toronto'),
('grupos','H',(SELECT id FROM equipos WHERE codigo='CPV'),(SELECT id FROM equipos WHERE codigo='KSA'),'2026-06-26 20:00:00-05','NRG Stadium','Houston'),
('grupos','H',(SELECT id FROM equipos WHERE codigo='URU'),(SELECT id FROM equipos WHERE codigo='ESP'),'2026-06-26 20:00:00-05','Estadio Akron','Zapopan'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='EGY'),(SELECT id FROM equipos WHERE codigo='IRN'),'2026-06-26 23:00:00-05','Lumen Field','Seattle'),
('grupos','G',(SELECT id FROM equipos WHERE codigo='NZL'),(SELECT id FROM equipos WHERE codigo='BEL'),'2026-06-26 23:00:00-05','BC Place','Vancouver'),

-- Sábado 27 jun
('grupos','L',(SELECT id FROM equipos WHERE codigo='PAN'),(SELECT id FROM equipos WHERE codigo='ENG'),'2026-06-27 17:00:00-05','MetLife Stadium','Nueva York'),
('grupos','L',(SELECT id FROM equipos WHERE codigo='CRO'),(SELECT id FROM equipos WHERE codigo='GHA'),'2026-06-27 17:00:00-05','Lincoln Financial Field','Filadelfia'),
('grupos','K',(SELECT id FROM equipos WHERE codigo='COL'),(SELECT id FROM equipos WHERE codigo='POR'),'2026-06-27 19:30:00-05','Hard Rock Stadium','Miami'),
('grupos','K',(SELECT id FROM equipos WHERE codigo='COD'),(SELECT id FROM equipos WHERE codigo='UZB'),'2026-06-27 19:30:00-05','Mercedes-Benz Stadium','Atlanta'),
('grupos','J',(SELECT id FROM equipos WHERE codigo='ALG'),(SELECT id FROM equipos WHERE codigo='AUT'),'2026-06-27 22:00:00-05','Arrowhead Stadium','Kansas City'),
('grupos','J',(SELECT id FROM equipos WHERE codigo='JOR'),(SELECT id FROM equipos WHERE codigo='ARG'),'2026-06-27 22:00:00-05','AT&T Stadium','Dallas');


-- ============================================================
-- 3. ELIMINATORIAS
-- Equipos TBD — el admin los asigna cuando se definan los cruces
-- Fechas y sedes según fixture oficial FIFA
-- ============================================================

INSERT INTO public.partidos (fase, fecha_hora, estadio, ciudad) VALUES

-- RONDA DE 32 (16 partidos — Jun 28 a Jul 3)
('dieciseisavos','2026-06-28 15:00:00-05','SoFi Stadium','Los Ángeles'),
('dieciseisavos','2026-06-29 13:00:00-05','NRG Stadium','Houston'),
('dieciseisavos','2026-06-29 16:30:00-05','Gillette Stadium','Boston'),
('dieciseisavos','2026-06-29 21:00:00-05','Estadio BBVA','Monterrey'),
('dieciseisavos','2026-06-30 13:00:00-05','AT&T Stadium','Dallas'),
('dieciseisavos','2026-06-30 17:00:00-05','MetLife Stadium','Nueva York'),
('dieciseisavos','2026-06-30 21:00:00-05','Estadio Azteca','Ciudad de México'),
('dieciseisavos','2026-07-01 12:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('dieciseisavos','2026-07-01 16:00:00-05','Lumen Field','Seattle'),
('dieciseisavos','2026-07-01 20:00:00-05','Levi''s Stadium','San Francisco'),
('dieciseisavos','2026-07-02 15:00:00-05','SoFi Stadium','Los Ángeles'),
('dieciseisavos','2026-07-02 19:00:00-05','BMO Field','Toronto'),
('dieciseisavos','2026-07-02 23:00:00-05','BC Place','Vancouver'),
('dieciseisavos','2026-07-03 14:00:00-05','AT&T Stadium','Dallas'),
('dieciseisavos','2026-07-03 18:00:00-05','Hard Rock Stadium','Miami'),
('dieciseisavos','2026-07-03 21:30:00-05','Arrowhead Stadium','Kansas City'),

-- RONDA DE 16 (8 partidos — Jul 4 a Jul 7)
('octavos','2026-07-04 13:00:00-05','NRG Stadium','Houston'),
('octavos','2026-07-04 17:00:00-05','Lincoln Financial Field','Filadelfia'),
('octavos','2026-07-05 16:00:00-05','MetLife Stadium','Nueva York'),
('octavos','2026-07-05 20:00:00-05','Estadio Azteca','Ciudad de México'),
('octavos','2026-07-06 15:00:00-05','AT&T Stadium','Dallas'),
('octavos','2026-07-06 20:00:00-05','Lumen Field','Seattle'),
('octavos','2026-07-07 12:00:00-05','Mercedes-Benz Stadium','Atlanta'),
('octavos','2026-07-07 16:00:00-05','BC Place','Vancouver'),

-- CUARTOS DE FINAL (4 partidos — Jul 9 a Jul 11)
('cuartos','2026-07-09 16:00:00-05','Gillette Stadium','Boston'),
('cuartos','2026-07-10 15:00:00-05','SoFi Stadium','Los Ángeles'),
('cuartos','2026-07-11 17:00:00-05','Hard Rock Stadium','Miami'),
('cuartos','2026-07-11 21:00:00-05','Arrowhead Stadium','Kansas City'),

-- SEMIFINALES (Jul 14 y 15)
('semifinal','2026-07-14 15:00:00-05','AT&T Stadium','Dallas'),
('semifinal','2026-07-15 15:00:00-05','Mercedes-Benz Stadium','Atlanta'),

-- TERCER PUESTO (Jul 18)
('tercero','2026-07-18 17:00:00-05','Hard Rock Stadium','Miami'),

-- FINAL (Jul 19)
('final','2026-07-19 15:00:00-05','MetLife Stadium','Nueva York');


-- ============================================================
-- VERIFICACIÓN — ejecutar después del INSERT para confirmar
-- ============================================================
-- SELECT fase, COUNT(*) FROM public.partidos GROUP BY fase ORDER BY fase;
-- Resultado esperado:
--   cuartos        → 4
--   dieciseisavos  → 16
--   final          → 1
--   grupos         → 72
--   octavos        → 8
--   semifinal      → 2
--   tercero        → 1
--   TOTAL          → 104
-- ============================================================
