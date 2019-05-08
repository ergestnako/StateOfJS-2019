import React, { memo, useMemo } from 'react'
import { sortBy } from 'lodash'
import PropTypes from 'prop-types'
import { colors } from '../../../constants'

const commonStyles = {
    bar: {
        position: 'relative',
        height: 24,
        marginBottom: 6
    },
    barLabel: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 1,
        padding: '0 10px',
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: '24px',
        color: '#222'
    }
}

const DoubleBar = memo(({ negativeColor, positiveValue, positiveColor, label }) => {
    return (
        <div
            style={{
                ...commonStyles.bar,
                background: negativeColor
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    height: '100%',
                    background: positiveColor,
                    width: `${positiveValue}%`
                }}
            />
            <div style={commonStyles.barLabel}>
                {label}:&nbsp;{positiveValue}%
            </div>
        </div>
    )
})

const SingleBar = memo(({ value, label, color }) => {
    return (
        <div style={commonStyles.bar}>
            <div
                style={{
                    background: color,
                    position: 'absolute',
                    height: '100%',
                    width: `${value}%`
                }}
            />
            <div style={commonStyles.barLabel}>
                {label}:&nbsp;{value}%
            </div>
        </div>
    )
})

const LegendChip = memo(({ color }) => (
    <span
        style={{
            width: 24,
            height: 24,
            background: color
        }}
    />
))

const DivergingLegend = memo(({ negativeLabel, negativeColor, positiveLabel, positiveColor }) => {
    return (
        <div
            style={{
                fontSize: '13px',
                fontWeight: 600,
                margin: '6px 0',
                display: 'grid',
                gridTemplateColumns: '24px auto auto 24px',
                gridColumnGap: 12,
                alignItems: 'center'
            }}
        >
            <LegendChip color={positiveColor} />
            <div>{positiveLabel}</div>
            <div style={{ textAlign: 'right' }}>{negativeLabel}</div>
            <LegendChip color={negativeColor} />
        </div>
    )
})

const ToolsOpinionMultiBarDiverging = ({ data }) => {
    const computedData = useMemo(() => {
        const satisfaction = sortBy(
            data.map(tool => {
                const satisfiedUsers = tool.opinion.buckets.find(
                    bucket => bucket.id === 'would_use'
                ).count
                const unsatisfiedUsers = tool.opinion.buckets.find(
                    bucket => bucket.id === 'would_not_use'
                ).count
                const total = satisfiedUsers + unsatisfiedUsers

                return {
                    id: tool.id,
                    satisfiedUsers: Math.round((satisfiedUsers / total) * 100),
                    unsatisfiedUsers: Math.round((unsatisfiedUsers / total) * 100)
                }
            }),
            'satisfiedUsers'
        ).reverse()
        const interest = sortBy(
            data.map(tool => {
                const interestedUsers = tool.opinion.buckets.find(
                    bucket => bucket.id === 'interested'
                ).count
                const uninterestedUsers = tool.opinion.buckets.find(
                    bucket => bucket.id === 'not_interested'
                ).count
                const total = interestedUsers + uninterestedUsers

                return {
                    id: tool.id,
                    interestedUsers: Math.round((interestedUsers / total) * 100),
                    uninterestedUsers: Math.round((uninterestedUsers / total) * 100)
                }
            }),
            'interestedUsers'
        ).reverse()
        const awareness = sortBy(
            data.map(tool => {
                const unawareUsers = tool.opinion.buckets.find(
                    bucket => bucket.id === 'never_heard'
                ).count

                return {
                    id: tool.id,
                    awareness: Math.round(
                        ((tool.opinion.total - unawareUsers) / tool.opinion.total) * 100
                    )
                }
            }),
            'awareness'
        ).reverse()

        return { satisfaction, interest, awareness }
    }, [data])

    return (
        <>
            <h4>multiple bars chart?</h4>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridColumnGap: '40px'
                }}
            >
                <div>
                    <h4>satisfaction amongst users</h4>
                    {computedData.satisfaction.map(tool => (
                        <DoubleBar
                            key={tool.id}
                            negativeValue={tool.unsatisfiedUsers}
                            negativeColor={colors.blueLighter}
                            positiveValue={tool.satisfiedUsers}
                            positiveColor={colors.blueLight}
                            label={tool.id}
                        />
                    ))}
                    <DivergingLegend
                        negativeLabel="not satisfied"
                        negativeColor={colors.blueLighter}
                        positiveLabel="satisfied"
                        positiveColor={colors.blueLight}
                    />
                </div>
                <div>
                    <h4>interest amongst non-users</h4>
                    {computedData.interest.map(tool => (
                        <DoubleBar
                            key={tool.id}
                            negativeValue={tool.uninterestedUsers}
                            negativeColor={colors.tealLight}
                            positiveValue={tool.interestedUsers}
                            positiveColor={colors.teal}
                            label={tool.id}
                        />
                    ))}
                    <DivergingLegend
                        negativeLabel="not interested"
                        negativeColor={colors.tealLight}
                        positiveLabel="interested"
                        positiveColor={colors.teal}
                    />
                </div>
                <div>
                    <h4>awareness</h4>
                    {computedData.awareness.map(tool => (
                        <SingleBar
                            key={tool.id}
                            label={tool.id}
                            value={tool.awareness}
                            color={colors.blueLight}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

ToolsOpinionMultiBarDiverging.propTypes = {
    data: PropTypes.array.isRequired
}

export default memo(ToolsOpinionMultiBarDiverging)
