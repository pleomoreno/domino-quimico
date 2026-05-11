import { useEffect, useMemo, useRef, useState } from "react"

const createTile = (id, left, right) => ({ id, left, right })

const dominoValues = [
	"Ácido",
	"Base",
	"Sal",
	"Óxido",
	"Hidreto",
	"HNO3",
	"H2SO4",
]

const shuffleArray = (list) => {
	const array = [...list]
	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

const buildDeck = () => {
	const tiles = []
	let index = 1
	for (let i = 0; i < dominoValues.length; i += 1) {
		for (let j = i; j < dominoValues.length; j += 1) {
			tiles.push(createTile(`T-${index}`, dominoValues[i], dominoValues[j]))
			index += 1
		}
	}
	return shuffleArray(tiles)
}

const dealHands = () => {
	const deck = buildDeck()
	const hands = { A: [], B: [], C: [], D: [] }
	players.forEach((player, playerIndex) => {
		const start = playerIndex * 7
		hands[player] = deck.slice(start, start + 7)
	})
	return hands
}

const players = ["A", "B", "C", "D"]

export default function GamePage() {
	const [hands, setHands] = useState(() => dealHands())
	const [board, setBoard] = useState([])
	const [currentTurn, setCurrentTurn] = useState(0)
	const [message, setMessage] = useState(
		"Início de jogo: jogue uma peça"
	)
	const [feedback, setFeedback] = useState(null)
	const [gameOver, setGameOver] = useState(false)
	const [summary, setSummary] = useState(null)
	const [mostMissedTile, setMostMissedTile] = useState(null)
	const feedbackTimeoutRef = useRef(null)
	const startTimeRef = useRef(Date.now())
	const [stats, setStats] = useState(() =>
		players.reduce((acc, player) => {
			acc[player] = { plays: 0, correct: 0, errors: 0, passes: 0 }
			return acc
		}, {})
	)

	const boardEnds = useMemo(() => {
		if (board.length === 0) return { left: null, right: null }
		return { left: board[0].left, right: board[board.length - 1].right }
	}, [board])

	const isPlayable = (tile) => {
		if (!boardEnds.left && !boardEnds.right) return true
		return (
			tile.left === boardEnds.left ||
			tile.right === boardEnds.left ||
			tile.left === boardEnds.right ||
			tile.right === boardEnds.right
		)
	}

	const isPlayableWithEnds = (tile, ends) => {
		if (!ends.left && !ends.right) return true
		return (
			tile.left === ends.left ||
			tile.right === ends.left ||
			tile.left === ends.right ||
			tile.right === ends.right
		)
	}

	const getBoardEndsFromBoard = (nextBoard) => {
		if (nextBoard.length === 0) return { left: null, right: null }
		return { left: nextBoard[0].left, right: nextBoard[nextBoard.length - 1].right }
	}

	const buildSummary = (nextHands, nextStats, winnerByEmpty, blocked) => {
		const totalPlays = players.reduce((sum, player) => {
			const playerStats = nextStats[player]
			return sum + playerStats.correct + playerStats.errors + playerStats.passes
		}, 0)
		const totalCorrect = players.reduce(
			(sum, player) => sum + nextStats[player].correct,
			0
		)
		const totalErrors = players.reduce(
			(sum, player) => sum + nextStats[player].errors,
			0
		)
		const totalPasses = players.reduce(
			(sum, player) => sum + nextStats[player].passes,
			0
		)
		const durationSec = Math.max(
			1,
			Math.round((Date.now() - startTimeRef.current) / 1000)
		)
		const ranking = [...players].sort((a, b) => {
			const diff = nextHands[a].length - nextHands[b].length
			if (diff !== 0) return diff
			return nextStats[b].correct - nextStats[a].correct
		})
		const champion = winnerByEmpty || null
		return {
			champion,
			ranking,
			totalPlays,
			totalCorrect,
			totalErrors,
			totalPasses,
			durationSec,
			blocked,
		}
	}

	const checkGameOver = (nextHands, nextBoard, nextStats) => {
		const winnerByEmpty = players.find(
			(player) => nextHands[player].length === 0
		)
		if (winnerByEmpty) {
			const blocked = false
			setGameOver(true)
			setSummary(buildSummary(nextHands, nextStats, winnerByEmpty, blocked))
			setMessage("Fim de partida")
			return true
		}
		return false
	}

	const getExplanationForType = (tile) => {
		switch (tile.left) {
			case "Ácido":
				return `${tile.right} é um Ácido pois libera H+ em solução aquosa.`
			case "Base":
				return `${tile.right} é uma base pois libera OH- em solução aquosa.`
			case "Sal":
				return `${tile.right} é um sal, composto iônico formado por cátion e ânion.`
			case "Óxido":
				return `${tile.right} é um óxido, composto binário com oxigênio.`
			case "Hidreto":
				return `${tile.right} é um hidreto, composto binário com hidrogênio.`
			default:
				return `Peça encaixada: ${tile.left} / ${tile.right}.`
		}
	}

	const showFeedback = (nextFeedback) => {
		if (feedbackTimeoutRef.current) {
			clearTimeout(feedbackTimeoutRef.current)
		}
		setFeedback(nextFeedback)
		feedbackTimeoutRef.current = setTimeout(() => {
			setFeedback(null)
		}, 2000)
	}

	const resetGame = () => {
		setHands(dealHands())
		setBoard([])
		setCurrentTurn(0)
		setMessage("Início de jogo: jogue uma peça")
		setFeedback(null)
		setGameOver(false)
		setSummary(null)
		setMostMissedTile(null)
		setStats(
			players.reduce((acc, player) => {
				acc[player] = { plays: 0, correct: 0, errors: 0, passes: 0 }
				return acc
			}, {})
		)
		startTimeRef.current = Date.now()
	}

	const handleSelectTile = (tile) => {
		if (players[currentTurn] !== "A" || gameOver) return
		const playable = isPlayable(tile)
		if (playable) {
			placeTile("A", tile.id)
			showFeedback({
				type: "success",
				title: "Correto!",
				message: getExplanationForType(tile),
			})
			return
		}
		setStats((prev) => ({
			...prev,
			A: {
				...prev.A,
				errors: prev.A.errors + 1,
			},
		}))
		setMostMissedTile(tile)
		showFeedback({
			type: "error",
			title: "Ops!",
			message: `A peça ${tile.left} / ${tile.right} não encaixa nas extremidades. Tente outra pedra.`,
		})
	}

	const placeTile = (playerKey, tileId) => {
		const hand = hands[playerKey]
		const tile = hand.find((item) => item.id === tileId)
		if (!tile) return

		let nextBoard = []
		if (board.length === 0) {
			nextBoard = [{ ...tile, orientation: "horizontal" }]
		} else {
			const canRight = tile.left === boardEnds.right || tile.right === boardEnds.right
			const canLeft = tile.left === boardEnds.left || tile.right === boardEnds.left
			if (!canRight && !canLeft) return

			const placeOnRight = canRight
			const placedTile = placeOnRight
				? tile.left === boardEnds.right
					? { ...tile, orientation: "horizontal" }
					: { ...tile, left: tile.right, right: tile.left, orientation: "horizontal" }
				: tile.right === boardEnds.left
					? { ...tile, orientation: "vertical" }
					: { ...tile, left: tile.right, right: tile.left, orientation: "vertical" }

			nextBoard = placeOnRight ? [...board, placedTile] : [placedTile, ...board]
		}

		const nextHands = {
			...hands,
			[playerKey]: hands[playerKey].filter((item) => item.id !== tileId),
		}
		const nextStats = {
			...stats,
			[playerKey]: {
				...stats[playerKey],
				plays: stats[playerKey].plays + 1,
				correct: stats[playerKey].correct + 1,
			},
		}

		setBoard(nextBoard)
		setHands(nextHands)
		setStats(nextStats)
		setMessage(`${playerKey} jogou ${tile.left}/${tile.right}`)
		if (!checkGameOver(nextHands, nextBoard, nextStats)) {
			setCurrentTurn((prev) => (prev + 1) % players.length)
		}
	}

	const handlePass = () => {
		if (gameOver) return
		const playerKey = players[currentTurn]
		const nextStats = {
			...stats,
			[playerKey]: {
				...stats[playerKey],
				passes: stats[playerKey].passes + 1,
			},
		}
		setStats(nextStats)
		setMessage(`Jogador ${players[currentTurn]} passou a vez`)
		setCurrentTurn((prev) => (prev + 1) % players.length)
		checkGameOver(hands, board, nextStats)
	}

	useEffect(() => {
		const playerKey = players[currentTurn]
		if (playerKey === "A" || gameOver) return

		const timeout = setTimeout(() => {
			const hand = hands[playerKey]
			const playable = hand.find((tile) => isPlayable(tile))
			if (playable) {
				placeTile(playerKey, playable.id)
				return
			}
			const nextStats = {
				...stats,
				[playerKey]: {
					...stats[playerKey],
					passes: stats[playerKey].passes + 1,
				},
			}
			setStats(nextStats)
			setMessage(`Jogador ${playerKey} passou a vez`)
			setCurrentTurn((prev) => (prev + 1) % players.length)
			checkGameOver(hands, board, nextStats)
		}, 650)

		return () => clearTimeout(timeout)
	}, [currentTurn, hands, boardEnds.left, boardEnds.right, gameOver, stats])

	useEffect(() => {
		return () => {
			if (feedbackTimeoutRef.current) {
				clearTimeout(feedbackTimeoutRef.current)
			}
		}
	}, [])

	return (
		<>
			<div className="relative w-screen h-screen bg-white overflow-hidden font-mono text-dq-red">
			{/* grid */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
						linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
					`,
					backgroundSize: "36px 36px",
				}}
			/>

			{/* cantos */}
			<Corner pos="top-3 left-3" borders="border-t-2 border-l-2" />
			<Corner pos="top-3 right-3" borders="border-t-2 border-r-2" />
			<Corner pos="bottom-3 left-3" borders="border-b-2 border-l-2" />
			<Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

			{/* top bar */}
			<div className="absolute top-0 left-0 right-0 h-12 bg-dq-red text-white flex items-center px-4">
				<div className="flex-1 text-center font-bold tracking-[4px] text-[16px]">
					DOMINO QUIMICO
				</div>
				<button
					type="button"
					className="w-8 h-8 flex items-center justify-center rounded-full border border-white/60 text-white hover:bg-white/10"
					aria-label="Fechar"
				>
					✕
				</button>
			</div>

			{/* board */}
			<div className="relative z-10 w-full h-full flex items-center justify-center pt-12">
				<div className="relative w-[94%] h-[82%] bg-neutral-200 border border-black/10 rounded-sm">
					{/* top hand */}
					<div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
						{hands.C.map((item) => (
							<HiddenTile key={item.id} orientation="vertical" />
						))}
					</div>
					<div className="absolute top-4 left-1/2 -translate-x-1/2 text-[14px] text-dq-text">
						Jogador C: <span className="text-dq-muted">{hands.C.length} Pedras</span>
					</div>

					{/* left hand */}
					<div className="absolute top-[54%] left-6 -translate-y-1/2 flex flex-col gap-2">
						{hands.B.map((item) => (
							<HiddenTile key={item.id} orientation="horizontal" />
						))}
					</div>
					<div className="absolute top-[12%] left-8 text-[14px] text-dq-text">
						Jogador B: <span className="text-dq-muted">{hands.B.length} Pedras</span>
					</div>

					{/* right hand */}
					<div className="absolute top-[54%] right-6 -translate-y-1/2 flex flex-col gap-2">
						{hands.D.map((item) => (
							<HiddenTile key={item.id} orientation="horizontal" />
						))}
					</div>
					<div className="absolute top-[12%] right-10 text-[14px] text-dq-text">
						Jogador D: <span className="text-dq-muted">{hands.D.length} Pedras</span>
					</div>

					{/* center info */}
					<div className="absolute inset-x-0 top-[38%] text-center text-[15px] text-dq-muted">
						{message}
					</div>

					{/* played tiles */}
					<div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
						{board.map((tile) => (
							<DominoTile
								key={tile.id}
								labelTop={tile.left}
								labelBottom={tile.right}
								orientation={tile.orientation || "horizontal"}
							/>
						))}
					</div>

					{/* bottom area */}
					<div className="absolute bottom-8 left-24">
						<div className="text-[15px] text-dq-text">Seu deck (Jogador A)</div>
						<button
							type="button"
							className="mt-2 bg-dq-red text-white text-[13px] px-6 py-2 rounded-full shadow-inner shadow-black/20 disabled:opacity-50"
							onClick={handlePass}
							disabled={players[currentTurn] !== "A" || gameOver}
						>
							PASSAR VEZ
						</button>
					</div>

					<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
						<div className="bg-neutral-300 rounded-[20px] px-4 py-3 flex items-center gap-2">
							{hands.A.map((item) => (
								<DominoTile
									key={item.id}
									labelTop={item.left}
									labelBottom={item.right}
									onClick={() => handleSelectTile(item)}
									isDisabled={players[currentTurn] !== "A" || gameOver}
									isInvalid={false}
								/>
							))}
						</div>
					</div>

					<div className="absolute bottom-8 right-10 text-[16px]">
						Vez: <span className="text-dq-text">Jogador {players[currentTurn]}</span>
					</div>
				</div>
			</div>
			</div>

			{feedback && !gameOver && (
			<div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
				<div className="w-[420px] bg-white rounded-xl border border-dq-red/40 shadow-[0_8px_30px_rgba(0,0,0,0.25)] px-8 py-6 text-center text-dq-text">
					<div
						className={`mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full ${
							feedback.type === "success"
								? "bg-emerald-500/10 text-emerald-500"
								: "bg-rose-500/10 text-rose-500"
						}`}
					>
						<span className="text-4xl font-bold">
							{feedback.type === "success" ? "✓" : "✕"}
						</span>
					</div>
					<h2 className="text-[20px] font-bold text-dq-text">{feedback.title}</h2>
					<p className="mt-2 text-[14px] text-dq-text leading-relaxed">
						{feedback.message}
					</p>
					<div className="mt-4 flex items-center gap-2">
						<div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden">
							<div
								className={`h-full ${
									feedback.type === "success"
										? "bg-emerald-500"
										: "bg-dq-red"
								}`}
								style={{ width: "28%" }}
							/>
						</div>
						<span className="text-[12px] text-dq-muted">2s</span>
					</div>
					{feedback.type === "error" && (
						<button
							type="button"
							className="mt-5 w-full bg-dq-red text-white text-[14px] py-2 rounded-full"
							onClick={() => setFeedback(null)}
						>
							Entendido
						</button>
					)}
				</div>
			</div>
			)}

			{gameOver && summary && (
				<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
					<div className="w-[92%] max-w-[980px] bg-neutral-100 rounded-2xl border border-dq-red/30 shadow-[0_12px_36px_rgba(0,0,0,0.25)] px-8 py-6 text-dq-text">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-[18px] text-dq-red font-bold">DOMINO QUIMICO</h2>
								<p className="text-[13px] text-dq-muted">Resumo da partida</p>
							</div>
							<div className="text-[12px] text-dq-muted">
								Tempo: {summary.durationSec}s
							</div>
						</div>

						<div className="mt-4 grid grid-cols-[1.4fr_0.9fr] gap-6">
							<div className="bg-dq-red/90 text-white rounded-xl px-6 py-5 shadow-inner shadow-black/20">
								<div className="flex items-center gap-4">
									<div className="text-[34px]">🏆</div>
									<div>
										<div className="text-[14px] uppercase tracking-[2px]">Fim de partida</div>
										<div className="text-[20px] font-bold">
											{summary.champion
												? `Campeão Jogador ${summary.champion}`
												: "Empate (bloqueio)"}
										</div>
										{summary.blocked && (
											<div className="text-[12px] text-white/80">
												Ninguém ficou sem pedras.
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl border border-dq-red/20 px-4 py-4">
								<div className="text-[14px] font-bold text-dq-red mb-2">Estatísticas da Partida</div>
								<div className="space-y-2 text-[13px]">
									<div className="flex items-center justify-between bg-neutral-100 rounded-md px-3 py-2">
										<span>Total de Jogadas</span>
										<strong>{summary.totalPlays}</strong>
									</div>
									<div className="flex items-center justify-between bg-neutral-100 rounded-md px-3 py-2">
										<span>Acertos totais da mesa</span>
										<strong className="text-emerald-600">{summary.totalCorrect}</strong>
									</div>
									<div className="flex items-center justify-between bg-neutral-100 rounded-md px-3 py-2">
										<span>Erros totais</span>
										<strong className="text-rose-600">{summary.totalErrors}</strong>
									</div>
									<div className="flex items-center justify-between bg-neutral-100 rounded-md px-3 py-2">
										<span>Passes totais</span>
										<strong className="text-dq-text">{summary.totalPasses}</strong>
									</div>
									<div className="bg-neutral-100 rounded-md px-3 py-2">
										<div className="text-[12px] text-dq-muted">Pedra mais difícil</div>
										<div className="mt-2 inline-flex items-center gap-2 bg-white border border-black/20 rounded-md px-2 py-1 text-[11px]">
											{mostMissedTile ? (
												<>
													<span>{mostMissedTile.left}</span>
													<span className="text-dq-muted">|</span>
													<span>{mostMissedTile.right}</span>
												</>
											) : (
												<span className="text-dq-muted">Sem dados</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-6 bg-dq-red/90 rounded-xl px-5 py-4 text-white">
							<div className="text-[14px] font-bold mb-2">Ranking final da partida</div>
							<div className="space-y-2">
								{summary.ranking.map((player, index) => (
									<div
										key={player}
										className="flex items-center justify-between bg-white/10 rounded-md px-3 py-2 text-[13px]"
									>
										<div className="flex items-center gap-2">
											<span className="font-bold">{index + 1}º</span>
											<span>Jogador {player}</span>
										</div>
										<div className="text-[12px] text-white/80">
											{hands[player].length} pedras | {stats[player].correct} acertos | {stats[player].errors} erros
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="mt-5 flex items-center justify-center gap-3">
							<button
								type="button"
								className="bg-dq-red text-white text-[13px] px-5 py-2 rounded-full"
								onClick={() => (window.location.href = "/")}
							>
								Voltar ao inicio
							</button>
							<button
								type="button"
								className="bg-white text-dq-red border border-dq-red text-[13px] px-5 py-2 rounded-full"
								onClick={resetGame}
							>
								Jogar Novamente
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

function Corner({ pos, borders }) {
	return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
}

function HiddenTile({ orientation = "vertical" }) {
	const base =
		"bg-white border border-black/50 rounded-[6px] shadow-[0_1px_0_rgba(0,0,0,0.15)]"
	const tileClass =
		orientation === "vertical" ? "w-[42px] h-[64px]" : "w-[64px] h-[42px]"
	return (
		<div className={`${base} ${tileClass}`} />
	)
}

function DominoTile({
	labelTop,
	labelBottom,
	orientation = "horizontal",
	onClick,
	isDisabled,
	isInvalid,
}) {
	const isVertical = orientation === "vertical"
	const base =
		"bg-white border border-black/50 rounded-[6px] shadow-[0_1px_0_rgba(0,0,0,0.15)] text-dq-text"
	return (
		<div
			className={`${base} ${
				isVertical ? "w-[48px] h-[54px]" : "w-[60px] h-[34px]"
			} flex ${isVertical ? "flex-col" : "flex-row"} ${
				isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
			} ${isInvalid ? "border-dq-red shadow-[0_0_0_2px_rgba(200,16,46,0.2)]" : ""}`}
			onClick={onClick}
		>
			<div
				className={`flex-1 flex items-center justify-center text-[9px] ${
					isVertical ? "border-b border-black/20" : "border-r border-black/20"
				}`}
			>
				{labelTop}
			</div>
			<div className="flex-1 flex items-center justify-center text-[9px]">
				{labelBottom}
			</div>
		</div>
	)
}
