---
publicado: true
nome: Física Moderna I
semestre: '2026.2'
status: atual
descricao: 'Curso de nível de graduação que descreve a quebra dos paradigmas da física clássica e o nascimento dos pilares da física moderna: A Teoria da Relatividade Especial e a Mecânica Quântica. '
imagem: /uploads/extensao-exemplo-1.jpg
ementa: 'Cenário Físico do final do século XIX. Cinemática e dinâmica relativística. Raios X e radioatividade. Problema do Corpo Negro. Efeito Fotoelétrico. A descoberta do elétron, próton e nêutron. Medida da carga elementar. Efeito Compton. Modelos atômicos. Teoria de de Broglie. Equação de Schrödinger. Função de onda e suas propriedades. Interpretação probabilística. Postulados da Mecânica Quântica. Soluções da equação de onda estacionária: partícula livre, barreira de potencial, poço de potencial. Princípio da incerteza.'
bibliografia:
  - referencia: 'Francisco Caruso e Vitor Oguri. Física Moderna: Origens Clássicas e Fundamentos Quânticos. Editora LTC, 2006/'
    url: 'https://www.scribd.com/document/482651495/Fisica-Moderna-Caruso-e-Oguri-pdf'
  - referencia: 'Robert Eisberg e Robert Resnick, Física Quântica: Átomos, Moléculas, Sólidos, Núcleos e Partículas. Editora LTC, 1979'
    url: 'https://archive.org/details/FsicaQunticaEisbergEResnick'
aulas:
  - numero: 1
    titulo: 'Aula Inaugural. Panorama geral sobre a física do século XIX. O princípio de Galileu e as transformações de Galileu. '
    data: '2026-08-10'
    descricao: 'Descrição do panorama da Física no inicio do século XIX. A Mecânica Clássica, a termodinâmica e o eletromagnetismo.'
    url: 'https://exemplo.invalid/rg-2026-2/aula-01'
  - numero: 2
    titulo: O debate sobre a natureza da luz. Teoria corpuscular vs ondulatória.
    data: '2026-08-17'
    descricao: 'Cálculo da reflexão e refração para as duas teorias.  A medida da velocidade da luz e a predileção pela teoria ondulatória.  A teoria moderna da luz:  O eletromagnetismo e as equações de Maxwell. Demonstração da equação de onda no vácuo a partir das equações de Maxwell.   '
    url: 'https://exemplo.invalid/rg-2026-2/aula-02'
  - numero: 3
    titulo: 'O conflito entre as transformações de Galileu e a equação da onda eletromagnética. '
    data: '2026-08-24'
    descricao: 'O conflito entre as transformações de Galileu e a equação da onda eletromagnética. A hipótese do Éter Luminífero. '
    url: 'https://exemplo.invalid/rg-2026-2/aula-03'
  - numero: 4
    titulo: A métrica de Kerr e buracos negros em rotação
    data: '2026-08-31'
    descricao: 'Ergosfera, horizontes interno e externo, e o teorema de unicidade.'
    url: 'https://exemplo.invalid/rg-2026-2/aula-04'
  - numero: 5
    titulo: Ondas gravitacionais no regime linearizado
    data: '2026-09-14'
    descricao: 'Perturbações da métrica de fundo, calibre TT e a fórmula de quadrupolo.'
    url: 'https://exemplo.invalid/rg-2026-2/aula-05'
listas:
  - titulo: Lista 1 — Geometria diferencial e tensores
    data_entrega: '2026-09-07'
    url: 'https://exemplo.invalid/rg-2026-2/lista-01'
  - titulo: Lista 2 — Soluções de vácuo e horizontes
    url: 'https://exemplo.invalid/rg-2026-2/lista-02'
materiais:
  - titulo: 'Slides — Módulo 1: geometria diferencial'
    tipo: slides
    descricao: 'Slides das três primeiras aulas, em PDF.'
    url: 'https://exemplo.invalid/rg-2026-2/slides-modulo-01'
  - titulo: Notas de aula — a métrica de Kerr
    tipo: notas
    url: 'https://exemplo.invalid/rg-2026-2/notas-kerr'
links:
  - titulo: Simulador de órbitas em Schwarzschild
    url: 'https://exemplo.invalid/rg-2026-2/simulador-orbitas'
scripts:
  - titulo: Raio do horizonte de Kerr
    descricao: '[EXEMPLO] Script de demonstração usado para verificar o plano 022 — conteúdo inventado, substituir por material real.'
    linguagem: python
    codigo: |-
      def raio_horizonte(massa, spin):
          """Retorna r+ para Kerr, com G = c = 1."""
          if abs(spin) > massa:
              raise ValueError('spin excede o limite extremo')
          return massa + (massa**2 - spin**2) ** 0.5

      for m in [1.0, 2.5]:
          r = raio_horizonte(m, 0.9 * m)
          print(f"M={m}: r+ = {r:.4f} 'unidades geometricas'")
    aula: 4
    url: 'https://exemplo.invalid/rg-2026-2/script-horizonte-kerr.py'
---

